import CryptoJS from "crypto-js";

class CryptoService {
  private encryptionKey: string = "";
  private encryptionIV: string = "";

  /**
   * Set encryption key and IV received from loadApplicationData API
   */
  setEncryptionConfig(key: string, iv: string): void {
    this.encryptionKey = key;
    this.encryptionIV = iv;
  }

  /**
   * Get CryptoJS AES key
   *
   * Angular:
   * CryptoJS.enc.Base64.parse(this.encryptionKey())
   */
  private getKey(): CryptoJS.lib.WordArray {
    return CryptoJS.enc.Base64.parse(this.encryptionKey);
  }

  /**
   * Get CryptoJS AES IV
   */
  private getIV(): CryptoJS.lib.WordArray {
    return CryptoJS.enc.Base64.parse(this.encryptionIV);
  }

  /**
   * Encrypt API request body
   *
   * Angular equivalent:
   * encryptPayloadsUsingAES256()
   */
  encryptPayloadsUsingAES256(body: any): string {
    const sanitizedBody = this.convertDates(body);

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(sanitizedBody),
      this.getKey(),
      {
        iv: this.getIV(),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return encrypted.toString();
  }

  /**
   * Decrypt API response
   */
  decryptAPIResponseUsingAES256(response: string): any {
    try {
      const decryptedText = CryptoJS.AES.decrypt(
        this.unwrapEncryptedResponse(response),
        this.getKey(),
        {
          iv: this.getIV(),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      ).toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        return response;
      }

      try {
        const parsedResponse = JSON.parse(decryptedText);

        return Array.isArray(parsedResponse) &&
          parsedResponse.every((item) => typeof item === "string")
          ? parsedResponse
          : this.convertKeysToCamelCase(parsedResponse);
      } catch {
        return decryptedText;
      }
    } catch {
      return response;
    }
  }

  /**
   * Encrypt local storage data
   *
   * Angular equivalent:
   * encryptData()
   */
  encryptData(text: any): string {
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(
        typeof text === "string" ? text : JSON.stringify(text)
      ),
      this.getKey(),
      {
        iv: this.getIV(),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return encrypted.toString();
  }

  /**
   * Decrypt local storage data
   *
   * Angular equivalent:
   * getDecryptedData()
   */
  getDecryptedData(encryptedData: string | null): object | null {
    if (!encryptedData || !this.encryptionKey) {
      return null;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        this.getKey(),
        {
          iv: this.getIV(),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        return null;
      }

      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  /**
   * Convert API object keys to camelCase
   *
   * Example:
   *
   * USER_NAME -> user_name
   * UserName  -> userName
   */
  convertKeysToCamelCase(data: any): any {
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return data;
      }

      const firstRow = data[0];

      if (!firstRow || typeof firstRow !== "object") {
        return data;
      }

      const keyMap: Record<string, string> = {};

      Object.keys(firstRow).forEach((key) => {
        const newKey =
          key.toUpperCase() === key
            ? key.toLowerCase()
            : key.charAt(0).toLowerCase() + key.slice(1);

        keyMap[key] = newKey;
      });

      return data.map((obj) => {
        if (!obj || typeof obj !== "object") {
          return obj;
        }

        const newObj: any = {};

        Object.keys(keyMap).forEach((oldKey) => {
          newObj[keyMap[oldKey]] = obj[oldKey];
        });

        return newObj;
      });
    }

    if (typeof data === "object" && data !== null) {
      const result: any = {};

      Object.keys(data).forEach((key) => {
        const newKey =
          key.toUpperCase() === key
            ? key.toLowerCase()
            : key.charAt(0).toLowerCase() + key.slice(1);

        result[newKey] = data[key];
      });

      return result;
    }

    return data;
  }

  private unwrapEncryptedResponse(response: string): string {
    const trimmedResponse = response.trim();

    try {
      const parsedResponse: unknown = JSON.parse(trimmedResponse);
      return typeof parsedResponse === "string"
        ? parsedResponse
        : trimmedResponse;
    } catch {
      return trimmedResponse;
    }
  }

  /**
   * Recursively convert Date objects to YYYY-MM-DD
   *
   * Angular equivalent:
   * convertDates()
   */
  private convertDates(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof Date) {
      return this.formatDate(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertDates(item));
    }

    if (typeof obj === "object") {
      const result: any = {};

      Object.keys(obj).forEach((key) => {
        result[key] = this.convertDates(obj[key]);
      });

      return result;
    }

    return obj;
  }

  /**
   * Format Date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /**
   * Check whether encryption configuration is available
   */
  isConfigured(): boolean {
    return Boolean(this.encryptionKey && this.encryptionIV);
  }
}

export const cryptoService = new CryptoService();