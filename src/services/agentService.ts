import { supabase } from "@/integrations/supabase/client";
import axios from "axios";

export const askQuestion = async (message: string): Promise<any> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_INVOICE_BE}/ai-agent/ask`,
      { message },
      {
        headers: {
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Ask error:", error);
    throw error;
  }
};
