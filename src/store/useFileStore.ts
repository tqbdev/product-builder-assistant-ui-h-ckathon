import { create } from "zustand";
import { ProcessedFile } from "@/types/file";
import { parseFileWithAPI } from "@/services/fileParser";
import { deleteFile } from "@/services/fileService";
import { checkInvoice, InvoiceData } from "@/services/invoiceCheckService";

interface FileStore {
  files: ProcessedFile[];
  isLoading: boolean;
  setFiles: (files: ProcessedFile[]) => void;
  setLoading: (loading: boolean) => void;
  addFiles: (newFiles: File[]) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  refreshFile: (id: string) => Promise<void>;
  updateInvoice: (id: string, invoiceData: InvoiceData) => Promise<void>;
  clearAllFiles: () => Promise<void>;
  getInvoiceById: (fileId: string, invoiceNumber: string) => InvoiceData | null;
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  isLoading: false,
  setFiles: (files) => set({ files }),
  setLoading: (loading) => set({ isLoading: loading }),
  addFiles: async (uploadedFiles) => {
    const newFiles: ProcessedFile[] = uploadedFiles.map((file: File) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      parsedContent: null,
      isProcessing: true,
    }));

    set((state) => ({ files: [...state.files, ...newFiles] }));

    // Parse files and update the store with parsed data
    const processedFiles: ProcessedFile[] = [];
    for (const fileObj of newFiles) {
      const processedFile = await parseFileWithAPI(fileObj);
      processedFiles.push(processedFile);
      set((state) => ({
        files: state.files.map((f) =>
          f.id === processedFile.id ? processedFile : f
        ),
      }));
    }
  },

  removeFile: async (id) => {
    const { files } = get();
    const fileToRemove = files.find((file) => file.id === id);
    if (!fileToRemove) return;

    try {
      await deleteFile(id, fileToRemove.storage_path);
      set((state) => ({
        files: state.files.filter((file) => file.id !== id),
      }));
    } catch (error) {
      console.error("Error removing file:", error);
    }
  },

  refreshFile: async (id) => {
    const { files } = get();
    const fileToRefresh = files.find((file) => file.id === id);
    if (!fileToRefresh) return;

    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, isLoading: true } : f
      ),
    }));

    const refreshedFile = await parseFileWithAPI({
      ...fileToRefresh,
      parsedContent: null,
    });

    set((state) => ({
      files: state.files.map((f) => (f.id === id ? refreshedFile : f)),
    }));
  },

  clearAllFiles: async () => {
    const { files } = get();
    try {
      for (const file of files) {
        await deleteFile(file.id, file.storage_path);
      }
      set({ files: [] });
    } catch (error) {
      console.error("Error clearing files:", error);
    }
  },

  updateInvoice: async (id, invoiceData) => {
    const { files } = get();
    const fileToUpdate = files.find((file) => file.id === id);
    fileToUpdate.parsedContent.map((line) => {
      if (line.id === invoiceData.id) {
        line.isValid = invoiceData.isValid;
      }
    });
    if (!fileToUpdate) return;

    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, ...fileToUpdate } : f
      ),
    }));
  },

  getInvoiceById: (fileId: string, invoiceNumber: string) => {
    const { files } = get();
    const file = files.find((f) => f.id === fileId);
    if (!file) return null;

    const invoice = file.parsedContent.find(
      (invoice) => invoice.invoiceNumber === invoiceNumber,
    );
    return invoice || null;
  },
}));
