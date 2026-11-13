import { useUploadFilesToRootFolderMutation } from "@/app/main/modules/warkdown/api/walkdownApi";

export interface UploadFile {
  uri: string;
  fileName?: string | null;
  name?: string | null;
  mimeType?: string | null;
  type?: string | null;
  size?: number | null;
}

interface UploadToFolderParams {
  files: UploadFile[];
  companyCode: string;
  folderType: string;
  objectId?: string;
  fileFlag?: "I" | "V" | "D" | "All";
}

export const useUploadToFolder = () => {
  const [uploadFilesToRootFolder, { isLoading, error, reset }] =
    useUploadFilesToRootFolderMutation();

  const uploadToFolder = async ({
    files,
    companyCode,
    folderType,
    objectId = "0",
    fileFlag = "All",
  }: UploadToFolderParams) => {
    if (!files?.length) {
      throw new Error("Please select at least one file.");
    }

    const allowedFormats: Record<string, string[]> = {
      I: ["jpg", "jpeg", "png", "webp", "svg"],
      V: ["mp4"],
      D: ["pdf", "pptx", "ppt", "xls", "xlsx", "docx", "doc", "txt"],
      All: [
        "pdf",
        "pptx",
        "ppt",
        "xls",
        "xlsx",
        "docx",
        "doc",
        "txt",
        "jpg",
        "jpeg",
        "png",
        "webp",
        "svg",
        "mp4",
      ],
    };

    const formData = new FormData();

    files.forEach((file, index) => {
      if (!file.uri) {
        throw new Error(`File URI missing at index ${index}`);
      }

      // Get original filename
      const rawFileName =
        file.fileName || file.name || `upload_${Date.now()}_${index}.jpg`;

      // Remove URL query parameters and hash
      const cleanPath = rawFileName.split(/[?#]/)[0];

      // Extract only the filename (handles URLs and paths)
      let fileName = cleanPath.split("/").pop() || cleanPath;

      // Decode URL-encoded filenames if required
      try {
        fileName = decodeURIComponent(fileName);
      } catch {
        // Keep original filename if decoding fails
      }

      // Extract actual extension
      const extension = fileName.split(".").pop()?.toLowerCase();

      // Validate file format
      if (!extension || !allowedFormats[fileFlag]?.includes(extension)) {
        throw new Error(`Invalid file format: ${fileName}`);
      }

      // Validate file size (50 MB)
      if (file.size != null && file.size > 50 * 1024 * 1024) {
        throw new Error("File size must be less than 50 MB.");
      }

      // Sanitize filename
      const trimmedName = fileName
        .replace(/\s/g, "")
        .replace(/[^A-Za-z0-9_.]+/g, "_");

      // Append file
      formData.append(`file${index}`, {
        uri: file.uri,
        name: companyCode === "IDC" ? fileName : trimmedName,
        type: file.mimeType || file.type || "application/octet-stream",
      } as any);
    });

    formData.append("companyCode", companyCode);
    formData.append("folderType", folderType);
    formData.append("objectId", String(objectId));

    const response = await uploadFilesToRootFolder(formData).unwrap();

    console.log("Uploaded files response:", response);

    return response;
  };

  return {
    uploadToFolder,
    isLoading,
    error,
    reset,
  };
};
