import { supabase } from "@/integrations/supabase/client";
import { ProcessedFile } from "@/types/file";
import { toast } from "@/lib/toast";

// Save file metadata and content to Supabase
export const saveFileToSupabase = async (
  file: ProcessedFile
): Promise<string> => {
  return;
  // try {
  //   // First, upload the file to storage
  //   const filePath = `${file.id}/${file.name}`;
  //   const { error: uploadError } = await supabase.storage
  //     .from("documents")
  //     .upload(filePath, file.file);

  //   if (uploadError) throw uploadError;

  //   // Then, save the file metadata and content to the database
  //   const { error: dbError } = await supabase.from("files").insert({
  //     id: file.id,
  //     user_id: (await supabase.auth.getUser()).data.user?.id,
  //     name: file.name,
  //     type: file.type,
  //     size: file.size,
  //     content: file.parsedContent,
  //     storage_path: filePath,
  //   });

  //   if (dbError) throw dbError;

  //   return file.id;
  // } catch (error: any) {
  //   toast.error("Failed to save file", { description: error.message });
  //   throw error;
  // }
};

// Get all files for the current user
export const getUserFiles = async (): Promise<ProcessedFile[]> => {
  return;
  // try {
  //   const { data, error } = await supabase
  //     .from('files')
  //     .select('*')
  //     .order('created_at', { ascending: false });
  //   if (error) throw error;
  //   if (!data || data.length === 0) return [];
  //   // Convert the database rows to ProcessedFile objects
  //   const files: ProcessedFile[] = await Promise.all(
  //     data.map(async (item) => {
  //       // Get a signed URL for the file
  //       const { data: fileData } = await supabase.storage
  //         .from('documents')
  //         .createSignedUrl(item.storage_path, 60);
  //       // Create a File object (or a mock if the file isn't available)
  //       const fileObj = new File(
  //         [new Blob([''], { type: item.type })],
  //         item.name,
  //         { type: item.type }
  //       );
  //       return {
  //         id: item.id,
  //         name: item.name,
  //         type: item.type,
  //         size: item.size,
  //         file: fileObj,
  //         parsedContent: item.content,
  //         isLoading: false,
  //         fileUrl: fileData?.signedUrl
  //       };
  //     })
  //   );
  //   return files;
  // } catch (error: any) {
  //   toast.error("Failed to fetch files", { description: error.message });
  //   return [];
  // }
};

// Update the file content
export const updateFileContent = async (
  id: string,
  content: Record<string, any>
): Promise<void> => {
  // try {
  //   const { error } = await supabase
  //     .from('files')
  //     .update({ content, updated_at: new Date().toISOString() })
  //     .eq('id', id);
  //   if (error) throw error;
  // } catch (error: any) {
  //   toast.error("Failed to update file", { description: error.message });
  //   throw error;
  // }
};

// Delete a file
export const deleteFile = async (
  id: string,
  storagePath: string | undefined
): Promise<void> => {
  try {
    // Delete from storage if we have a path
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([storagePath]);

      if (storageError) throw storageError;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("files")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;
  } catch (error: any) {
    toast.error("Failed to delete file", { description: error.message });
    throw error;
  }
};
