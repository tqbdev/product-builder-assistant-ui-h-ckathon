import React, { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragging) {
      setDragging(true);
    }
  };

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];
    
    for (const file of files) {
      if (validTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        toast.error(`Invalid file type: ${file.name}`, {
          description: "Only PDF and image files are allowed"
        });
      }
    }
    
    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    
    if (validFiles.length > 0) {
      onFileUpload(validFiles);
      toast.success(`${validFiles.length} files uploaded successfully`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);
      
      if (validFiles.length > 0) {
        onFileUpload(validFiles);
        toast.success(`${validFiles.length} files uploaded successfully`);
      }
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 transition-all text-center",
        "hover:border-app-blue hover:bg-app-gray-light/30",
        dragging ? "border-app-blue bg-app-gray-light/50" : "border-gray-300",
        "animate-fade-in"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        multiple
        accept="application/pdf,image/*"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-app-blue/10 rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-app-blue" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-app-gray-dark">
            Drag and drop files here
          </h3>
          <p className="text-app-gray mt-1">
            PDFs and Excels only (PDF, XLSX)
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <FileText className="h-4 w-4 text-app-gray" />
            <ImageIcon className="h-4 w-4 text-app-gray" />
          </div>
        </div>
        <Button
          onClick={triggerFileInput}
          className="bg-app-blue hover:bg-app-blue-light"
        >
          Browse Files
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
