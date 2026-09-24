import { AssetForm, AssetSection } from "./assetForm.types";

export const initialAssetForm: AssetForm = {
  general: {
    assetName: "",
  },

  location: {
    location: null,
    // area: null,
  },

  classification: {
    assetType: null,
    assetClass: null,
    // priority: null,
    serialNumber: "",
    // workGroup: null,
  },

  technical: {
    manufacturer: null,
    model: "",
    installedDate: null,
    // vendor: null,
  },

  // financial: {
  //   purchasePrice: "",
  //   failureClass: null,
  //   criticality: null,
  // },

  // lifecycle: {
  //   endOfLife: null,
  // },

  custom: {
    uploadePhotos: [],
  },
};

export type AssetField = {
  id: number;
  fieldName: string;
  apiFieldName: string;
  label: string;
  category: number;
  section: keyof AssetForm;
  flag: number;
  isMandatory: boolean;
  suggested: any;
  suggestedName: any;
  displayOrder: number;
  value: any;
};

export const categorySectionMap: Record<number, AssetSection> = {
  1: "general",
  2: "location",
  3: "classification",
  4: "technical",
  // 5: "financial",
  // 6: "lifecycle",
  7: "custom",
};

export const apiFieldMap: Record<string, string> = {
  AX_AssetName: "assetName",

  AX_Location: "location",
  // AX_area: "area",

  AX_AssetType: "assetType",
  AX_AssetClass: "assetClass",
  // AX_Priority: "priority",
  AX_SerialNum: "serialNumber",
  // AX_AssetGroup: "AssetGroup",

  AX_Manufacturer: "manufacturer",
  AX_MakeModel: "model",
  AX_InstalledDate: "installedDate",
  // AX_Vendor: "vendor",

  // AX_PurchasePrice: "purchasePrice",
  // AX_FailureClass: "FailureClass",
  // OldECRRanking: "OldECRRanking",
  // AX_Estendoflife: "endOfLife",
};

export const assetStepConfig = [
  {
    key: "asset-location",
    title: "Asset & Location",
    sections: ["general", "location", "custom"] as AssetSection[],
  },
  // {
  //   key: "custom",
  //   title: "Upload Documents",
  //   sections: ["custom"] as AssetSection[],
  // },
  {
    key: "classification",
    title: "Classification",
    sections: ["classification"] as AssetSection[],
  },
  {
    key: "technical",
    title: "Manufacturer & Technical",
    sections: ["technical"] as AssetSection[],
  },
  // {
  //   key: "financial",
  //   title: "Financial & Maintenance",
  //   sections: ["financial", "lifecycle"] as AssetSection[],
  // },
];
