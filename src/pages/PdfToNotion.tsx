import { useNavigate } from "react-router-dom";
import FileUpload from "@/components/FileUpload";
import FileListItem from "@/components/FileListItem";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { useFileStore } from "@/store/useFileStore";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import ReactDOM from "react-dom";
import InvoiceTemplate from "../components/Invoice-template.tsx";
import { InvoiceData } from "@/services/invoiceCheckService";
import JSZip, { file } from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import BlockRenderer from "@/components/BlockRenderer";

const PdfToNotion = () => {
  const { files, isLoading, addFileWithNotionContents, removeFile, refreshFile, clearAllFiles } =
    useFileStore();
  const { user, isLoading: isLoadingContext } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<InvoiceData>();
  const [blockData, setBlockData] = useState<any[]>([]);
  console.log('blockData',blockData)
  const invoiceRef = useRef();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);


  useEffect(() => {
    if (files && files.length > 0 && files[0]?.parsedContent)
       { setBlockData(files[0].parsedContent); }
    else {
      setBlockData([]);
    }
  }, [files])
  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (!user) {
      toast.error("You must be logged in to upload files");
      navigate("/auth");
      return;
    }
    await addFileWithNotionContents(uploadedFiles);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container max-w-5xl py-8 px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-app-gray-dark mb-2">
            Product Builder Assistant
          </h1>
          <p className="text-app-gray max-w-2xl mx-auto">
            Upload PDFs and Excels to extract and edit their content. Our
            backend will analyze each file and return the information.
          </p>
        </div>

        <FileUpload onFileUpload={handleFileUpload} />

        {isLoading ? (
          <div className="mt-8 text-center">
            <p className="text-app-gray">Loading your files...</p>
          </div>
        ) : files.length > 0 ? (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-app-gray-dark">
                Your Files ({files.length})
              </h2>
            </div>
            <BlockRenderer blocks={blockData} />
          </div>
        ) : (
          <div className="mt-8 text-center bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-app-gray">
              No files yet. Upload your first document to get started!
            </p>
          </div>
        )}
      </div>
      {isVisible &&
        ReactDOM.createPortal(
          <div ref={invoiceRef}>
            <InvoiceTemplate invoiceData={data} />
          </div>,
          document.body
        )}
    </div>
  );
};

export default PdfToNotion;
