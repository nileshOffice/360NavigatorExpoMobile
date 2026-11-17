export interface AssetFormValues {
  assetName?: string | null;
  location?: string | null;
  assetType?: string | null;
  assetClass?: string | null;
  serialNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  installedDate?: string | Date | null;
}

const isFilled = (value: unknown): boolean => {
  return value !== null && value !== undefined && String(value).trim() !== "";
};

const formatDate = (value: string | Date): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getSelectionDisplayValue = (value: unknown): string => {
  if (!isFilled(value)) {
    return "";
  }

  const stringValue = String(value);

  // Supports values such as:
  // "123~Electrical"
  // "Electrical"
  if (stringValue.includes("~")) {
    const [, displayValue] = stringValue.split("~");

    return displayValue?.trim() || "";
  }

  return stringValue.trim();
};

export const buildAssetDataString = (form: AssetFormValues): string => {
  const finalData: string[] = [];

  const appendField = (key: string, value: unknown, isSelection = false) => {
    if (!isFilled(value)) {
      return;
    }

    const formattedValue = isSelection
      ? getSelectionDisplayValue(value)
      : String(value).trim();

    if (!isFilled(formattedValue)) {
      return;
    }

    finalData.push(`${key}:${formattedValue}`);
  };

  // Asset Name
  appendField("NAME", form.assetName);

  // Location
  appendField("LOCATION", form.location, true);

  // Asset Type
  appendField("ASSETTYPE", form.assetType, true);

  // Asset Class
  appendField("ASSETCLASS", form.assetClass, true);

  // Serial Number
  appendField("SERIALNUM", form.serialNumber);

  // Manufacturer
  appendField("MANUFACTURER", form.manufacturer, true);

  // Model
  appendField("MODEL", form.model);

  // Installed Date
  if (isFilled(form.installedDate)) {
    appendField("INSTALLDATE", formatDate(form.installedDate as string | Date));
  }

  // Default status
  //   finalData.push("STATUS:A-ACTIVE");

  return finalData.join("~");
};
