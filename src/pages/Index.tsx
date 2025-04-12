import FileUpload from "@/components/FileUpload";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/lib/toast";
import { useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import { parseFile } from "@/services/fileParser.ts";
import { InvoiceData } from "@/services/invoiceCheckService";
import { useRef, useState } from "react";
import ReactDOM from "react-dom";
import InvoiceTemplate from "../components/Invoice-template.tsx";
import { TravelInsuranceForm } from "@/components/TravelInsuranceForm";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, isLoading: isLoadingContext } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<InvoiceData>();
  const [isUploading, setIsUploading] = useState(false);
  const [schema, setSchema] = useState(null);
  const [logic, setLogic] = useState(null); // Add this state for logic handling if needed
  console.log('logic: ', logic);

  const invoiceRef = useRef();
  const navigate = useNavigate();

  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (!user) {
      toast.error("You must be logged in to upload files");
      navigate("/auth");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await parseFile(formData);
      if (response.status === 201) {
        toast.success('Files uploaded successfully');
      }
      const { data } = response?.data;
      const excelData = data.excel;
      setSchema(excelData.userInputSchema);
      console.log('data.userInputSchema: ', excelData.userInputSchema);
      const logic = excelData.jsCode;
      setLogic(logic);
    } catch (error) {
      toast.error('Failed to upload files');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
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

        <div className="relative">
          <FileUpload onFileUpload={handleFileUpload} />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {isUploading && (
          <div className="mt-4 text-center text-app-gray">
            <p>Processing your files...</p>
          </div>
        )}
      </div>

      {isVisible && ReactDOM.createPortal(
        <div ref={invoiceRef}>
          <InvoiceTemplate invoiceData={data} />
        </div>,
        document.body
      )}

      {schema && !isUploading && (
        <div className="mt-8">
          <TravelInsuranceForm schema={schema} logic={logic} />
        </div>
      )}
    </div>
  );
};

export default Index;
