export type SelectOption = {
  id: number | string;
  name: string;
};

export type AssetImage = {
  id: string;
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number;
  height?: number;
};

export type AssetForm = {
  general: {
    assetName: string;
  };

  location: {
    location: SelectOption | null;
    // area: SelectOption | null;
  };

  classification: {
    assetType: SelectOption | null;
    assetClass: SelectOption | null;
    // priority: SelectOption | null;
    serialNumber: string;
    // workGroup: SelectOption | null;
  };

  technical: {
    manufacturer: SelectOption | null;
    model: string;
    installedDate: string | null;
    // vendor: SelectOption | null;
  };

  // financial: {
  //   purchasePrice: string;
  //   failureClass: SelectOption | null;
  //   criticality: SelectOption | null;
  // };

  // lifecycle: {
  //   endOfLife: string | null;
  // };

  custom: {
    uploadePhotos: AssetImage[];
  };
};

export type AssetSection =
  | "general"
  | "location"
  | "classification"
  | "technical"
  // | "financial"
  // | "lifecycle"
  | "custom";

export type AssetField = {
  id: number;
  fieldName: string;
  apiFieldName: string;
  label: string;
  category: number;
  section: AssetSection;
  flag: number;
  isMandatory: boolean;
  suggested: any;
  suggestedName: any;
  displayOrder: number;
  value: any;
};
