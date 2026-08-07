import CryptoJS from "crypto-js";

let encryptionKey = "";
let encryptionIV = "";

const setEncryptionConfig = (key: string, iv: string): void => {
  encryptionKey = key;
  encryptionIV = iv;
};

const isConfigured = (): boolean => !!(encryptionKey && encryptionIV);

const getKey = () => {
  if (!encryptionKey) {
    throw new Error(
      "Encryption key is not set. Call setEncryptionConfig() first."
    );
  }

  return CryptoJS.enc.Base64.parse(encryptionKey);
};

const getIV = () => {
  if (!encryptionIV) {
    throw new Error(
      "Encryption IV is not set. Call setEncryptionConfig() first."
    );
  }

  return CryptoJS.enc.Base64.parse(encryptionIV);
};

const encryptData = (text: string): string => {
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(text),
    getKey(),
    {
      iv: getIV(),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return encrypted.toString();
};

const decryptData = (
  encryptedData: string | null
): object | null => {
  if (!encryptedData) {
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(
      encryptedData,
      getKey(),
      {
        iv: getIV(),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const decrypted = bytes.toString(
      CryptoJS.enc.Utf8
    );

    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};

const encryptPayloadsUsingAES256 = (
  body: unknown
): string => {
  const sanitizedBody = convertDates(body);

  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(sanitizedBody),
    getKey(),
    {
      iv: getIV(),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return encrypted.toString();
};

const decryptAPIResponseUsingAES256 = (
  response: string
): unknown => {
  const decryptedText = CryptoJS.AES.decrypt(
    response,
    getKey(),
    {
      iv: getIV(),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString(CryptoJS.enc.Utf8);

  try {
    const parsedResponse = JSON.parse(decryptedText);

    if (
      Array.isArray(parsedResponse) &&
      parsedResponse.every(
        (item) => typeof item === "string"
      )
    ) {
      return parsedResponse;
    }

    return convertKeysToCamelCase(parsedResponse);
  } catch {
    return decryptedText;
  }
};

const convertKeysToCamelCase = (
  data: unknown
): unknown => {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return [];
    }

    const firstRow = data[0];

    if (
      typeof firstRow !== "object" ||
      firstRow === null
    ) {
      return data;
    }

    const keyMap: Record<string, string> = {};

    Object.keys(firstRow).forEach((key) => {
      keyMap[key] =
        key.toUpperCase() === key
          ? key.toLowerCase()
          : key.charAt(0).toLowerCase() +
            key.slice(1);
    });

    return data.map((obj) => {
      if (
        typeof obj !== "object" ||
        obj === null
      ) {
        return obj;
      }

      const result: Record<string, unknown> = {};

      Object.keys(keyMap).forEach((oldKey) => {
        result[keyMap[oldKey]] =
          (obj as Record<string, unknown>)[oldKey];
      });

      return result;
    });
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const result: Record<string, unknown> = {};

    Object.keys(data).forEach((key) => {
      const newKey =
        key.toUpperCase() === key
          ? key.toLowerCase()
          : key.charAt(0).toLowerCase() +
            key.slice(1);

      result[newKey] =
        (data as Record<string, unknown>)[key];
    });

    return result;
  }

  return data;
};

const convertDates = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return formatDate(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertDates(item));
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};

    Object.keys(obj).forEach((key) => {
      result[key] = convertDates(
        (obj as Record<string, unknown>)[key]
      );
    });

    return result;
  }

  return obj;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const cryptoService = {
  setEncryptionConfig,
  isConfigured,
  encryptData,
  decryptData,
  encryptPayloadsUsingAES256,
  decryptAPIResponseUsingAES256,
};