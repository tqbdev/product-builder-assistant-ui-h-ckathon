import { supabase } from "@/integrations/supabase/client";
import { ProcessedFile } from "@/types/file";
import axios from "axios";

export const parseFile = async (file: File): Promise<any> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_INVOICE_BE}/upload/file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${session?.access_token}`,
        },
      },
    );
    console.log("response: ", response);

    if (response.data.message === "Success") {
      return response.data.data.invoiceData;
    }
    return response;
  } catch (error) {
    console.error("Upload error:", error);
  }
};

export const parseFileWithAPI = async (
  fileObj: ProcessedFile,
): Promise<ProcessedFile> => {
  try {
    const content = await parseFile(fileObj.file);
    return {
      ...fileObj,
      parsedContent: content,
      isProcessing: false,
      error: undefined,
    };
  } catch (error) {
    return {
      ...fileObj,
      parsedContent: null,
      isProcessing: false,
      error: "Failed to parse file. Please try again.",
    };
  }
};

