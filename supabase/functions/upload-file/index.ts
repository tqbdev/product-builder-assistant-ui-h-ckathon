import { Application, Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";
import { HumanMessage, MessageContent } from "npm:@langchain/core/messages";
import { btoa } from "node:buffer";
import { z } from "npm:zod";
import pdf from "npm:pdf-parse";

const extractTextFromPdf = async (file: any) => {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const data = await pdf(bytes);
    const extractedText = data.text;
    return extractedText;
  } catch (error) {
    console.log("error: ", error);
  }
};

const invoiceResponseSchema = z.array(z.object({
  taxCode: z.string().describe("The tax code of the seller"),
  invoiceSymbol: z.string().describe("The invoice symbol of the seller"),
  invoiceNumber: z.string().describe("The invoice number of the seller"),
  totalTax: z.string().describe("The total tax of the seller"),
  totalBill: z.string().describe("The total bill of the seller"),
}));

const router = new Router();
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: Deno.env.get("GOOGLE_API_KEY"),
  temperature: 1.5,
});

const structuredLlm = model.withStructuredOutput(invoiceResponseSchema);
function arrayBufferToBase64(buffer: any) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}
const pdfToBase64 = async (file: any) => {
  const buffer = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  const fileContent = `data:${file.type};base64,${base64}`;
  return fileContent;
};
router.post("/upload-file", async (ctx: any) => {
  ctx.response.headers.set(
    "Access-Control-Allow-Origin",
    "*",
  );
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS",
  );
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  ctx.response.headers.set("Access-Control-Max-Age", "86400");

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }
  const form = await ctx.request.body.formData();
  const file = form.get("file");
  if (!file) {
    ctx.response.status = 400;
    ctx.response.body = { message: "No file uploaded" };
    return;
  }
  let fileContent = await extractTextFromPdf(file);
  if (!fileContent || fileContent.length === 0 || fileContent.length < 100) {
    fileContent = await pdfToBase64(file);
  }

  const content: MessageContent = [
    {
      type: "text",
      text: `The attached file maybe contain multiple invoice. 
      Extract the invoice details and return only a valid JSON object, without code blocks, backticks,
     or extra formatting. The response should be a list of JSON object with the following format: 
          {
        taxCode: string;
        invoiceSymbol: string;
        invoiceNumber: string;
        totalTax: string;
        totalBill: string;
          },
    After that, you must return a valid JSON object with the following format:
      with taxCode you must use the taxCode of the seller (do not use taxCode of buyer) that appears in each invoice.
      with invoiceSymbol you must remove the first character of invoiceSymbol that appears in each invoice. The result of InvoiceSymbol only have 6 characters.
      with invoiceNumber you must remove all remove leading zeros.
      with totalTax and totalBill you must remove all commas and dots.
    `,
    },
  ];

  if (fileContent.startsWith("data:")) {
    // pdf base 6
    content.push({
      type: "image_url",
      image_url: {
        url: fileContent,
      },
    });
  } else {
    content.push({
      type: "text",
      text: fileContent,
    });
  }
  try {
    const response = await structuredLlm.invoke([
      new HumanMessage({ content }),
    ]);
    ctx.response.status = 200;
    ctx.response.body = response;
  } catch (error) {
    console.log(error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal Server Error" };
  }
});
const app = new Application();

app.use(router.routes());
app.use(
  oakCors({
    origin: Deno.env.get("FE_URL") || "*",
  }),
);
app.use(router.allowedMethods());
await app.listen({ port: 8000 });
