import { useNavigate } from "react-router-dom";
import FileUpload from "@/components/FileUpload";
import FileListItem from "@/components/FileListItem";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";

import Header from "@/components/Header";
import { useFileStore } from "@/store/useFileStore";
import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import ReactDOM from "react-dom";
import InvoiceTemplate from "../components/Invoice-template.tsx";
import { InvoiceData } from "@/services/invoiceCheckService";
import JSZip, { file } from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

const Index = () => {
  const { files, isLoading, addFiles, removeFile, refreshFile, clearAllFiles } =
    useFileStore();
  const { user, isLoading: isLoadingContext } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<InvoiceData>();

  const invoiceRef = useRef();

  const navigate = useNavigate();

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (!files || files.length === 0) {
        toast.error("No files to download");
        return;
      }
      if (!user) {
        toast.error("You must be logged in to download files");
        navigate("/auth");
        return;
      }

      const zip = new JSZip();

      for (const file of files) {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: "a4",
        });

        for (const invoice of file.parsedContent) {
          setData(invoice);
          setIsVisible(true);
          await new Promise((resolve) => setTimeout(resolve, 100));

          const canvas = await html2canvas(invoiceRef.current, {
            width: 1512,
            height: 740,
            scale: 1,
          });

          const imgData = canvas.toDataURL("image/png", 0.8);
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = 1512 / 2;
          const imgHeight = 740 / 2;

          // Calculate coordinates to center the image
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;

          pdf.addImage(
            imgData,
            "PNG",
            x,
            y,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
          );

          if (
            file.parsedContent.indexOf(invoice) <
            file.parsedContent.length - 1
          ) {
            pdf.addPage();
          }

          setIsVisible(false);
        }

        const pdfBlob = pdf.output("blob");
        zip.file(`${file.name}.pdf`, pdfBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "invoices.zip");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (!user) {
      toast.error("You must be logged in to upload files");
      navigate("/auth");
      return;
    }
    await addFiles(uploadedFiles);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container max-w-5xl py-8 px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-app-gray-dark mb-2">
            Invoice Auto
          </h1>
          <p className="text-app-gray max-w-2xl mx-auto">
            Upload PDFs and images to extract and edit their content. Our
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
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading || files.length === 0}
              >
                <Download
                  className={`h-4 w-4 mr-1 ${
                    isDownloading ? "animate-spin" : ""
                  }`}
                />
                {isDownloading ? "Downloading..." : "Download all"}
              </Button>
              <Button
                variant="outline"
                onClick={clearAllFiles}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {files.map((file) => (
                <FileListItem
                  key={file.id}
                  file={file}
                  onRemove={removeFile}
                  onRefresh={refreshFile}
                  onCheckAgain={refreshFile}
                />
              ))}
            </div>
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

export default Index;
