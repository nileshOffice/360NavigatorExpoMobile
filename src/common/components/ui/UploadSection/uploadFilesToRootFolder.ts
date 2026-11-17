import { cryptoService } from "@/src/lib/services/crypto/cryptoService";
import { File as ExpoFile } from "expo-file-system";
import { useUploadFilesToRootFolderMutation } from "@/src/main/modules/walkdown/api/walkdownApi";

export interface UploadFile {
  uri: string;
  fileName?: string | null;
  name?: string | null;
  mimeType?: string | null;
  type?: string | null;
  size?: number | null;
}

export type FileFlag = "I" | "V" | "D" | "All";

interface UploadToFolderParams {
  files: UploadFile[];
  companyCode: string;
  folderType: string;
  objectId?: string;
  fileFlag?: FileFlag;
}

/** Server folder used for asset walkdown photos (same as the update flow). */
export const ASSET_IMAGE_FOLDER_TYPE = "PMO/Asset";

/**
 * True for files that only exist on this device and therefore still need to
 * be uploaded. Photos already on the server come back as http(s) URLs.
 */
export const isLocalFileUri = (uri?: string | null): boolean =>
  !!uri && /^(file|content|ph|assets-library):/i.test(uri);

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "svg"];
const ALLOWED_FORMATS: Record<FileFlag, string[]> = {
  I: IMAGE_FORMATS,
  V: ["mp4"],
  D: ["pdf", "pptx", "ppt", "xls", "xlsx", "docx", "doc", "txt"],
  All: [
    "pdf", "pptx", "ppt", "xls", "xlsx", "docx", "doc", "txt",
    ...IMAGE_FORMATS,
    "mp4",
  ],
};

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "application/pdf": "pdf",
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Builds a multipart file part that works with BOTH fetch implementations.
 *
 * Expo SDK 56+ installs `expo/fetch` as the global fetch. Its FormData
 * serializer only accepts strings, Blobs, or objects with `bytes()`, and
 * throws "Unsupported FormDataPart implementation" for the classic React
 * Native `{ uri, name, type }` object, so uploads failed on the device
 * before any request was sent.
 *
 * We keep `{ uri, name, type }` (read by React Native's own fetch/XHR) and
 * add a non-enumerable `bytes()` that reads the file with expo-file-system
 * (read by expo/fetch). Non-enumerable so React Native's native networking
 * still receives exactly `{ uri, name, type }`.
 */
const createFilePart = ({
  uri,
  name,
  type,
}: {
  uri: string;
  name: string;
  type: string;
}): Blob => {
  const part = { uri, name, type };

  Object.defineProperty(part, "bytes", {
    enumerable: false,
    value: () => new ExpoFile(uri).bytes(),
  });

  return part as unknown as Blob;
};

const getBaseName = (value: string): string => {
  const cleanPath = value.split(/[?#]/)[0];
  let name = cleanPath.split("/").pop() || cleanPath;
  try {
    name = decodeURIComponent(name);
  } catch {
    // keep the raw name
  }
  return name;
};

const getExtension = (name: string): string | undefined => {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
};

/**
 * Picks a file name with a valid extension. The picker often returns
 * `fileName: null` on Android, and the camera never sets one, so fall back to
 * the URI and then to the MIME type.
 */
const resolveFileName = (file: UploadFile, index: number): string => {
  const candidates = [file.fileName, file.name, file.uri].filter(
    (value): value is string => !!value,
  );

  for (const candidate of candidates) {
    const name = getBaseName(candidate);
    if (getExtension(name)) {
      return name;
    }
  }

  const mime = (file.mimeType || file.type || "").toLowerCase();
  const extension = MIME_EXTENSIONS[mime] ?? "jpg";
  return `upload_${Date.now()}_${index}.${extension}`;
};

/**
 * Pulls the server file paths out of the upload response.
 * Accepts the shapes the API has been seen to return: an array of
 * `{ filePath }`, a wrapper object (`data` / `files` / `result`), or plain
 * strings.
 */
export const extractUploadedFilePaths = (response: unknown): string[] => {
  let items: unknown = response;

  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = [items];
    }
  }

  if (items && !Array.isArray(items) && typeof items === "object") {
    const wrapper = items as Record<string, unknown>;
    items = wrapper.data ?? wrapper.files ?? wrapper.result ?? [wrapper];
  }

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const file = item as Record<string, unknown>;
        return (file.filePath ?? file.path ?? file.url ?? file.fileName) as string | undefined;
      }
      return undefined;
    })
    .filter((path): path is string => typeof path === "string" && path.trim() !== "");
};

/**
 * Best-effort read of the new asset's id from saveAssetWalkDownDetails.
 * Handles a bare number/string or an object with a common id field.
 */
export const extractCreatedAssetId = (response: unknown): number | null => {
  const toId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
  };

  if (typeof response === "number" || typeof response === "string") {
    return toId(response);
  }

  if (response && typeof response === "object") {
    const body = response as Record<string, unknown>;
    const nested =
      body.data && typeof body.data === "object"
        ? (body.data as Record<string, unknown>)
        : undefined;

    for (const key of ["assetId", "id", "id21", "objectId"]) {
      const id = toId(body[key] ?? nested?.[key]);
      if (id != null) return id;
    }
  }

  return null;
};

/** Human-readable reason for an upload failure (shown in toasts). */
export const getUploadErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  const fetchError = error as { status?: unknown; error?: string; data?: unknown };

  if (fetchError?.status === "FETCH_ERROR") {
    return "Network error while uploading. Check your connection and try again.";
  }

  if (typeof fetchError?.status === "number") {
    if (fetchError.status === 413) {
      return "The photos are too large for the server. Try fewer photos at a time.";
    }
    return `The server rejected the upload (HTTP ${fetchError.status}).`;
  }

  return "Photos could not be uploaded.";
};

export const useUploadToFolder = () => {
  const [uploadFilesToRootFolder, { isLoading, error, reset }] =
    useUploadFilesToRootFolderMutation();

  /** Uploads the files and returns the server paths of the stored files. */
  const uploadToFolder = async ({
    files,
    companyCode,
    folderType,
    objectId = "0",
    fileFlag = "All",
  }: UploadToFolderParams): Promise<string[]> => {
    if (!files?.length) {
      throw new Error("Please select at least one file.");
    }

    const formData = new FormData();

    files.forEach((file, index) => {
      if (!file.uri) {
        throw new Error(`File URI missing at index ${index}`);
      }

      const fileName = resolveFileName(file, index);
      const extension = getExtension(fileName);

      if (!extension || !ALLOWED_FORMATS[fileFlag]?.includes(extension)) {
        // e.g. HEIC from an iPhone gallery: convert before uploading.
        throw new Error(`Unsupported photo format: ${fileName}`);
      }

      if (file.size != null && file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 50 MB.");
      }

      const sanitizedName = fileName
        .replace(/\s/g, "")
        .replace(/[^A-Za-z0-9_.]+/g, "_");

      formData.append(
        `file${index}`,
        createFilePart({
          uri: file.uri,
          name: companyCode === "IDC" ? fileName : sanitizedName,
          type:
            file.mimeType ||
            file.type ||
            (IMAGE_FORMATS.includes(extension)
              ? `image/${extension === "jpg" ? "jpeg" : extension === "svg" ? "svg+xml" : extension}`
              : "application/octet-stream"),
        }),
      );
    });

    // Same wire format the interceptor used to produce, but built here.
    // Previously baseQuery rewrote FormData's private `_parts` array AFTER
    // the request had been dispatched. Redux's mutation check (dev) flags
    // that as a state mutation and the upload failed; it also relied on a
    // private React Native field.
    if (cryptoService.isConfigured()) {
      formData.append(
        "metadata",
        cryptoService.encryptPayloadsUsingAES256({
          companyCode,
          folderType,
          objectId: String(objectId),
        }),
      );
    } else {
      formData.append("companyCode", companyCode);
      formData.append("folderType", folderType);
      formData.append("objectId", String(objectId));
    }

    const response = await uploadFilesToRootFolder(formData).unwrap();
    const filePaths = extractUploadedFilePaths(response);

    if (filePaths.length === 0) {
      if (__DEV__) {
        console.warn("[upload] Unexpected upload response:", response);
      }
      throw new Error("The server did not return the uploaded file paths.");
    }

    return filePaths;
  };

  return {
    uploadToFolder,
    isLoading,
    error,
    reset,
  };
};
