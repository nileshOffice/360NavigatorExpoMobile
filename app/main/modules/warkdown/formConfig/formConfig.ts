import { AssetColumn } from "../api/walkdownApi.types";
import {
  AssetForm,
  AssetSection,
  UpdatedAssetForm
} from "./assetForm.types";

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

export const initialUpdatedAssetForm: UpdatedAssetForm = {
  general: {
    originalAssetName: "",
    updatedAssetName: "",
  },

  location: {
    originalLocation: null,
    updatedLocation: null,
    // area: null,
  },

  classification: {
    originalAssetType: null,
    updatedAssetType: null,
    originalAssetClass: null,
    updatedAssetClass: null,
    // priority: null,
    originalSerialNumber: "",
    updatedSerialNumber: "",
    // workGroup: null,
  },

  technical: {
    originalManufacturer: null,
    updatedManufacturer: null,
    originalModel: "",
    updatedModel: "",
    originalInstalledDate: null,
    updatedInstalledDate: null,
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
const findField = (fields: AssetColumn[], fieldName: string) => {
  return fields.find(
    (item) => item?.aXColunmName?.toLowerCase() === fieldName.toLowerCase(),
  );
};

export const mapSelectedAssetUpdatedToForm = (
  apiData: AssetColumn[],
): UpdatedAssetForm => {
  const assetName = findField(apiData, "AX_AssetName");
  const location = findField(apiData, "AX_Location");

  const assetType = findField(apiData, "AX_AssetType");
  const assetClass = findField(apiData, "AX_AssetClass");
  const serialNumber = findField(apiData, "AX_SerialNum");

  const manufacturer = findField(apiData, "AX_Manufacturer");
  const model = findField(apiData, "AX_MakeModel");
  const installedDate = findField(apiData, "AX_InstalledDate");

  return {
    general: {
      originalAssetName: assetName?.aXColunmNameData ?? "",

      updatedAssetName: assetName?.colunmNameData ?? "",
    },

    location: {
      originalLocation: location?.aXColunmNameData
        ? {
            id: location.aXColunmNameData,
            name: location.aXColunmNameData,
          }
        : null,

      updatedLocation: location?.colunmNameData
        ? {
            id: location.colunmNameData,
            name: location.colunmNameData,
          }
        : null,
    },

    classification: {
      originalAssetType: assetType?.aXColunmNameData
        ? {
            id: assetType.aXColunmNameData,
            name: assetType.aXColunmNameData,
          }
        : null,

      updatedAssetType: assetType?.colunmNameData
        ? {
            id: assetType.colunmNameData,
            name: assetType.colunmNameData,
          }
        : null,

      originalAssetClass: assetClass?.aXColunmNameData
        ? {
            id: assetClass.aXColunmNameData,
            name: assetClass.aXColunmNameData,
          }
        : null,

      updatedAssetClass: assetClass?.colunmNameData
        ? {
            id: assetClass.colunmNameData,
            name: assetClass.colunmNameData,
          }
        : null,

      originalSerialNumber: serialNumber?.aXColunmNameData ?? "",

      updatedSerialNumber: serialNumber?.colunmNameData ?? "",
    },

    technical: {
      originalManufacturer: manufacturer?.aXColunmNameData
        ? {
            id: manufacturer.aXColunmNameData,
            name: manufacturer.aXColunmNameData,
          }
        : null,

      updatedManufacturer: manufacturer?.colunmNameData
        ? {
            id: manufacturer.colunmNameData,
            name: manufacturer.colunmNameData,
          }
        : null,

      originalModel: model?.aXColunmNameData ?? "",

      updatedModel: model?.colunmNameData ?? "",

      originalInstalledDate: installedDate?.aXColunmNameData ?? null,

      updatedInstalledDate: installedDate?.colunmNameData ?? null,
    },

    custom: {
      uploadePhotos: [],
    },
  };
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
