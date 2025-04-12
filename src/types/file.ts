import { InvoiceData } from "@/services/invoiceCheckService";

export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  parsedContent: any;
  isProcessing: boolean;
  error?: string;
  fileUrl?: string;
  storage_path?: string;
}
