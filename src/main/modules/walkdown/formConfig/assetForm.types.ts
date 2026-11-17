export type SelectOption = {
  id: number | string;
  name: string;
};

export type AssetImage = {
  // type: string;
  id: string;
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  // width?: number;
  // height?: number;
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

export type UpdatedAssetForm = {
  general: {
    originalAssetName: string;
    updatedAssetName: string;
  };

  location: {
    originalLocation: SelectOption | null;
    updatedLocation: SelectOption | null;

    // area: SelectOption | null;
  };

  classification: {
    originalAssetType: SelectOption | null;
    updatedAssetType: SelectOption | null;
    originalAssetClass: SelectOption | null;
    updatedAssetClass: SelectOption | null;
    // priority: SelectOption | null;
    originalSerialNumber: string;
    updatedSerialNumber: string;
    // workGroup: SelectOption | null;
  };

  technical: {
    originalManufacturer: SelectOption | null;
    updatedManufacturer: SelectOption | null;
    originalModel: string;
    updatedModel: string;
    originalInstalledDate: string | null;
    updatedInstalledDate: string | null;
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
  // section: AssetSection;
  flag: number;
  isMandatory: boolean;
  suggested: any;
  suggestedName: any;
  displayOrder: number;
  value: any;
};
