import { Application, Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import axios from "npm:axios";
import { render } from "https://deno.land/x/resvg_wasm/mod.ts";
import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";
import { HumanMessage } from "npm:@langchain/core/messages";

const proxyServer = "https://proxy-rjjc.onrender.com/?url=";
const MAX_RETRIES = 3;
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: Deno.env.get("GOOGLE_API_KEY"),
  temperature: 1.5,
});

const router = new Router();
const svgToBase64 = async (base64Svg: string): Promise<string> => {
  let svgString = base64Svg;
  svgString = svgString.replace(/width="(\d+)"/, 'width="400"'); // Replace width
  svgString = svgString.replace(/height="(\d+)"/, 'height="80"'); // Replace height
  const png = await render(svgString);
  const binaryString = String.fromCharCode.apply(null, png);
  const base64String = btoa(binaryString);
  return `data:image/png;base64,${base64String}`;
};
const removeStrokeFromSVG = (svg: string): string => {
  return svg.replace(/\\/g, "").replace(/\s*stroke="[^"]*"/g, "");
};

const getCaptcha = async (): Promise<{ key: string; content: string }> => {
  const response = await axios.get(
    `${proxyServer}https://hoadondientu.gdt.gov.vn:30000/captcha`,
  );
  const { key, content } = response.data;
  return {
    key,
    content: removeStrokeFromSVG(content),
  };
};

const parseCaptcha = async (): Promise<{ key: string; captcha: string }> => {
  const { key, content } = await getCaptcha();
  const pngBase64 = await svgToBase64(content);

  const response = await model.invoke([
    new HumanMessage({
      content: [
        {
          type: "text",
          text:
            "Extract the text from this captcha image and return only the text without any additional explanation.",
        },
        {
          type: "image_url",
          image_url: {
            url: pngBase64,
          },
        },
      ],
    }),
  ]);
  return {
    key,
    captcha: response.content.toString(),
  };
};
router.get("/check-invoice", async (ctx: any) => {
  const urlSearchParams = ctx.request.url.searchParams;
  try {
    const { key, captcha } = await parseCaptcha();
    const url =
      `${proxyServer}https://hoadondientu.gdt.gov.vn:30000/query/guest-invoices?`;
    const params = {
      khmshdon: "1",
      hdon: "01",
      nbmst: urlSearchParams.get("taxCode"),
      khhdon: urlSearchParams.get("invoiceSymbol"),
      shdon: urlSearchParams.get("invoiceNumber"),
      tgtthue: "",
      tgtttbso: urlSearchParams.get("totalBill"),
      cvalue: captcha,
      ckey: key,
    };
    const response = await axios.get(url, { params });
    if ("nbmst" in response.data) {
      ctx.response.body = { message: "Success", data: response.data };
    } else {
      ctx.response.body = { message: "Failed" };
    }
  } catch (error: any) {
    ctx.response.body = { message: "Failed", error: error.message };
  }
});

const app = new Application();
app.use((ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  return next();
});
app.use(router.routes());
app.use(
  oakCors(),
);
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
