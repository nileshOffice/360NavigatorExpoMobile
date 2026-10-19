export interface ObjectImagelist {
  id?: any;
  fileName?: string;
  filePath?: string;
  url?: string;
  objectFlag?: string; // I= image, D- document, V- video
  objectId?: number;
  newFilePath?: string;
  displayName?: string;
  status?: string;
  progress?: number;
  isImageUsed?: boolean; //1 : image is used and should not be delete from the Root folder. only delete entry from the database table, 0 : delete from root and tbl as well
  steps?: StepItem[]; // per-file AI processing step timeline, used to run/track multiple files concurrently
}

export interface StepItem {
  stepNo: number;
  icon: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "completed";
}
