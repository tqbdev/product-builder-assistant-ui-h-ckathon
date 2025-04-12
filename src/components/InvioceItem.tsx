import { checkInvoice, InvoiceData } from "@/services/invoiceCheckService";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check, Download, ChevronDown, X, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { motion } from "framer-motion";
import { useFileStore } from "@/store/useFileStore";
import { memo } from "react";
import ReactDOM from "react-dom";
import InvoiceTemplate from "@/components/Invoice-template";
import html2canvas from "html2canvas-pro";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

interface InvoiceItemProps {
  fileId: string;
  invoiceData: InvoiceData;
}
const InvoiceItem: React.FC<InvoiceItemProps> = memo(
  ({ fileId, invoiceData }) => {
    const [data, setData] = useState(invoiceData);
    const { updateInvoice } = useFileStore();
    const [isLoading, setIsLoading] = useState(
      invoiceData.isProcessing || false
    );
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      setData(invoiceData);
      setIsLoading(invoiceData.isProcessing || false);
      if (invoiceData.isValid === false || invoiceData.isValid === undefined)
        handleCheckAgain();
    }, [invoiceData]);

    const [isVisible, setIsVisible] = useState(false);
    const invoiceRef = useRef();

    const handleDownload = () => {
      setIsVisible(true); // Make the invoice temporarily visible for rendering
      setTimeout(() => {
        html2canvas(invoiceRef.current, {
          // windowWidth: 6024,
          // windowHeight: 1080,
          width: 1512,
          height: 740,
          scale: 1,
          // useCORS: true,
        }).then((canvas) => {
          // Convert canvas to PNG image
          const imageUrl = canvas.toDataURL("image/png");

          // Create an anchor element to trigger the download
          const link = document.createElement("a");
          link.href = imageUrl;
          link.download = "invoice.png";
          link.click();

          // Hide the invoice after rendering
          setIsVisible(false);
        });
      }, 0); //
    };

    const handleUpdate = (updatedData: InvoiceData) => {
      updatedData.isValid = false;
      setData(updatedData);
    };

    const handleCheckAgain = async () => {
      setIsLoading(true);
      try {
        const response = await checkInvoice(data);
        let newInvoiceData: InvoiceData;
        if (response?.message === "Success") {
          newInvoiceData = {
            ...data,
            isValid: response.isValid,
          };
          setData(newInvoiceData);
          updateInvoice(fileId, newInvoiceData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className={`flex w-full
           my-4 rounded-xl p-4 items-start justify-between
           ${
             isLoading
               ? "bg-gray-100"
               : data.isValid
               ? "bg-green-100"
               : "bg-red-100"
           }
           `}
        >
          <RefreshCw className={` mr-1 ${isLoading ? "animate-spin" : ""}`} />
          <span>Invoice #{data.invoiceNumber}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isOpen ? "auto" : 0,
              opacity: isOpen ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="bg-gray-50 my-4 rounded-xl p-4"
          >
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data).map(([key, value]) => {
                if (["id", "isValid", "isProcessing"].includes(key))
                  return null;
                return (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-app-gray-dark capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <Input
                      value={value as string}
                      // type={
                      //   ["totalBill", "totalTax"].includes(key) ? "number" : "text"
                      // }
                      onChange={(e) => {
                        const updatedData = {
                          ...data,
                          [key]: e.target.value,
                        };
                        handleUpdate(updatedData);
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-8 gap-4">
              {isLoading ? (
                <div className="mt-4 h-10 flex items-center justify-center col-span-2 bg-app-gray-light rounded-md animate-pulse">
                  <div className="h-full bg-gray-200 rounded-md w-full"></div>
                </div>
              ) : (
                <div
                  className={`mt-4 h-10 flex items-center rounded-sm justify-center col-span-4 ${
                    data.isValid
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {data.isValid
                    ? "This invoice is valid"
                    : "This invoice is invalid"}
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleCheckAgain}
                className="mt-4 col-span-1"
                disabled={isLoading}
              >
                <Check className="h-5 w-5 mr-1" />
                Check
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isLoading}
                className="mt-4 col-span-1"
              >
                <Download className="h-5 w-5 mr-1" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    className="mt-4 col-span-1"
                  >
                    <Eye className="h-5 w-5 mr-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] w-fit h-fit p-0">
                  <div className="w-[1512px] h-[740px] scale-100 origin-top-left">
                    <InvoiceTemplate invoiceData={data} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
          {isVisible &&
            ReactDOM.createPortal(
              <div ref={invoiceRef}>
                <InvoiceTemplate invoiceData={data} />
              </div>,
              document.body
            )}
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

export default InvoiceItem;
