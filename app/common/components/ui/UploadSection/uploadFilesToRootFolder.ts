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
    if (!files?.length) return [];

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
      const uri = file.uri;

      if (!uri) return;

      const fileName =
        file.fileName || file.name || `upload_${Date.now()}_${index}.jpg`;

      const extension = fileName.split(".").pop()?.toLowerCase();

      if (!extension || !allowedFormats[fileFlag].includes(extension)) {
        throw new Error(`Invalid file format: ${fileName}`);
      }

      if (file.size && file.size / (1024 * 1024) > 50) {
        throw new Error("File size should be less than 50 MB.");
      }

      const trimmedName = fileName
        .replace(/\s/g, "")
        .replace(/[^A-Za-z0-9_.]+/g, "_");

      formData.append(`file${index}`, {
        uri,
        name: companyCode === "IDC" ? fileName : trimmedName,
        type: file.mimeType || file.type || "application/octet-stream",
      } as unknown as Blob);
    });

    formData.append("companyCode", companyCode);
    formData.append("folderType", folderType);
    formData.append("objectId", String(objectId));

    const response = await uploadFilesToRootFolder(formData).unwrap();

    return response;
  };

  return {
    uploadToFolder,
    isLoading,
    error,
    reset,
  };
};
