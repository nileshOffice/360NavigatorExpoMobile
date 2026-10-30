export type FileFlag = "I" | "V" | "D" | "All";

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface UploadFilesRequest {
  files: UploadFile[];
  companyCode: string;
  folderType: string;
  objectId?: string;
  fileFlag?: FileFlag;
}

export interface UploadedFileResponse {
  id: number;
  fileName: string;
  filePath: string;
  url: string;
  isImageUsed: boolean;
}

interface UploadApiResponse {
  filePath?: string;
  url?: string;
}

const ALLOWED_FORMATS: Record<FileFlag, string[]> = {
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

// Validate files
export const validateUploadFiles = (
  files: UploadFile[],
  fileFlag: FileFlag = "All",
): void => {
  if (!files?.length) {
    throw new Error("Please select at least one file.");
  }

  for (const file of files) {
    if (file.size != null && file.size / (1024 * 1024) > 50) {
      throw new Error("File size should be less than 50 MB.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !ALLOWED_FORMATS[fileFlag].includes(extension)) {
      throw new Error("Invalid file format.");
    }
  }
};

// Create FormData
export const createUploadFormData = ({
  files,
  companyCode,
  folderType,
  objectId = "0",
  fileFlag = "All",
}: UploadFilesRequest): FormData => {
  validateUploadFiles(files, fileFlag);

  const formData = new FormData();

  files.forEach((file, index) => {
    const trimmedName = file.name
      .replace(/\s/g, "")
      .replace(/[^A-Za-z0-9_.]+/g, "_");

    formData.append(`file${index}`, {
      uri: file.uri,
      name: companyCode === "IDC" ? file.name : trimmedName,
      type: file.type || "application/octet-stream",
    } as unknown as Blob);
  });

  formData.append("companyCode", companyCode);
  formData.append("folderType", folderType);
  formData.append("objectId", String(objectId));

  return formData;
};

// Map API response
export const mapUploadedFiles = (
  response: UploadApiResponse[],
): UploadedFileResponse[] => {
  return response.map((file) => {
    const filePath = file.filePath ?? "";

    const fullFileName = filePath.substring(filePath.lastIndexOf("/") + 1);

    const separatorIndex = fullFileName.indexOf("_");

    return {
      id: 0,
      fileName:
        separatorIndex >= 0
          ? fullFileName.substring(separatorIndex + 1)
          : fullFileName,
      filePath,
      url: file.url ?? "",
      isImageUsed: false,
    };
  });
};
