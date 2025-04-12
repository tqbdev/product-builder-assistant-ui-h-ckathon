import axios from "axios";
export interface InvoiceData {
  id: string;
  taxCode: string;
  invoiceSymbol: string;
  invoiceNumber: string;
  totalTax: string;
  totalBill: string;
  isValid: boolean;
  isProcessing: boolean;
}
import { supabase } from "@/integrations/supabase/client";

export const checkInvoice = async (
  invoiceData: InvoiceData,
): Promise<any> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await axios.get(
      `${import.meta.env.VITE_INVOICE_BE}/invoice/check`,
      {
        params: invoiceData,
        headers: {
          "Content-Type": "multipart/form-data",
          "Cache-Control": "no-cache",
          "ngrok-skip-browser-warning": "69421",
          Authorization: `Bearer ${session?.access_token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
  }
};
