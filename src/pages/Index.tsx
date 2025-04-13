import FileUpload from "@/components/FileUpload";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/lib/toast";
import { useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import { parseFile } from "@/services/fileParser.ts";
import { useEffect, useRef, useState } from "react";
import { TravelInsuranceForm } from "@/components/TravelInsuranceForm";
import { Loader2 } from "lucide-react";
import BlockRenderer from "@/components/BlockRenderer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { askQuestion } from "@/services/agentService";

const Index = () => {
  const { user, isLoading: isLoadingContext } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [schema, setSchema] = useState(null);
  const [logic, setLogic] = useState(null);
  const [blocks, setBlocks] = useState(null);
  const [isAiResponding, setIsAiResponding] = useState(false);

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
        formData.append("files", file);
      });

      const response = await parseFile(formData);
      if (response.status === 201) {
        toast.success("Files uploaded successfully");
      }
      const { data } = response?.data;
      const excelData = data.excel;
      const blocks = data.blocks;
      if (blocks.length > 0) {
        setBlocks(blocks);
      }
      if (excelData != null) {
        setSchema(excelData?.userInputSchema);
        const logic = excelData.jsCode;
        setLogic(logic);
      }
    } catch (error) {
      toast.error("Failed to upload files");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! How can I help you with this insurance product?",
    },
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChatSubmit = async (message: string) => {
    // Handle chat message submission
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
    ]);
    setMessage("");
    setIsAiResponding(true);

    try {
      const response = await askQuestion(message);
      if (response.status >= 200 && response.status < 300) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: response.data },
        ]);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("An error occurred while getting a response");
      console.error("Chat error:", error);
    } finally {
      setIsAiResponding(false);
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

      <div className="mt-8 flex justify-center items-center">
        <Tabs>
          <TabsList className="w-full bg-transparent">
            {blocks && blocks.length && (
              <TabsTrigger value="product">Product brochude</TabsTrigger>
            )}
            {schema && !isUploading && (
              <TabsTrigger value="form">Buy</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="product">
            <div className="flex flex-col md:flex-row items-start justify-center gap-4 p-4">
              <div className="w-full md:w-2/3">
                <BlockRenderer blocks={blocks} />
              </div>
              <div className="w-full md:w-1/3 sticky top-4 self-start border rounded-lg shadow-md p-4 bg-white">
                <div className="flex flex-col h-[500px]">
                  <div className="text-lg font-medium mb-2">Chat with us</div>
                  <div className="flex-1 overflow-y-auto mb-4 p-2 space-y-2 bg-gray-50 rounded">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg max-w-[80%] ${
                          msg.role === "assistant"
                            ? "bg-blue-100 mr-auto"
                            : "bg-white ml-auto border"
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))}
                    {isAiResponding && (
                      <div className="p-2 rounded-lg max-w-[80%] bg-blue-100 mr-auto">
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleChatSubmit(message);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleChatSubmit(message)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleChatSubmit(message);
                        }
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="form">
            <TravelInsuranceForm schema={schema} logic={logic} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
