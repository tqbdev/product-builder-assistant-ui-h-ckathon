import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Download,
  Image as ImageIcon,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { ProcessedFile } from "@/types/file";
import InvoiceItem from "./InvioceItem";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import html2canvas from "html2canvas-pro";

interface FileListItemProps {
  file: ProcessedFile;
  onRemove: (id: string) => void;
  onRefresh: (id: string) => void;
  onCheckAgain: (id: string) => void;
}

const FileListItem: React.FC<FileListItemProps> = ({
  file,
  onRemove,
  onRefresh,
  onCheckAgain,
}) => {
  const [parsedContent, setParsedContent] = useState(file.parsedContent || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    setParsedContent(file.parsedContent);
  }, [file]);

  const getFileIcon = () => {
    if (file.type.includes("pdf")) {
      return <FileText className="h-10 w-10 text-app-blue" />;
    }
    return <ImageIcon className="h-10 w-10 text-app-blue" />;
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await onRefresh(file.id);
    setIsLoading(false);
  };

  const handleRemove = () => {
    onRemove(file.id);
    toast.info("File removed");
  };

  const renderParsedContent = () => {
    if (!parsedContent) return null;
    return parsedContent?.map((item, index) => {
      return (
        <InvoiceItem
          key={item.invoiceNumber + item.totalBill}
          invoiceData={item}
          fileId={file.id}
        />
      );
    });
  };

  // const handleExportAll = async () => {
  //   for (let i = 0; i < refs.current.length; i++) {
  //     const node = refs.current[i];
  //     if (node?.download) {
  //       await node.download();
  //     }
  //   }
  // };
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg p-4 mb-4 animate-slide-up shadow-sm hover:shadow transition-all bg-white">
        <div className="flex-1 items-start gap-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`shrink-0  ${isLoading ? "animate-spin" : ""}`}>
                  {getFileIcon()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-app-gray-dark truncate">
                    {file.name}
                  </h3>
                  <p className="text-sm text-app-gray">
                    {(file.size / 1024).toFixed(2)} KB • {file.type}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* <Button
                  variant="outline"
                  onClick={handleExportAll}
                  disabled={isLoading}
                  size="sm"
                >
                  <Download
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Download
                </Button> */}
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Upload again
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleRemove}
                  className="text-app-gray hover:text-destructive"
                  aria-label="Remove file"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <div className="flex-1 min-w-0">
            <CollapsibleContent>
              <div className="mt-4">
                {file.isProcessing ? (
                  <div className="bg-app-gray-light rounded-md p-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  renderParsedContent()
                )}
              </div>
            </CollapsibleContent>
          </div>
        </div>
      </div>
    </Collapsible>
  );
};

export default FileListItem;
