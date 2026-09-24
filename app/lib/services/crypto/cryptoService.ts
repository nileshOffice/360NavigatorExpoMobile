import * as CryptoJS from "crypto-js";

class CryptoService {
  private encryptionKey: string = "";
  private encryptionIV: string = "";

  // =========================================================
  // CONFIGURATION
  // =========================================================

  /**
   * Configure AES encryption key and IV.
   *
   * Angular:
   * parts[8] = key
   * parts[9] = iv
   */
  configure(key: string, iv: string): void {
    this.encryptionKey = key;
    this.encryptionIV = iv;
  }

  /**
   * Clear encryption configuration.
   */
  clear(): void {
    this.encryptionKey = "";
    this.encryptionIV = "";
  }

  /**
   * Check whether encryption is ready.
   */
  isConfigured(): boolean {
    return Boolean(this.encryptionKey && this.encryptionIV);
  }

  // =========================================================
  // KEY / IV
  // =========================================================

  private getKey(): CryptoJS.lib.WordArray {
    if (!this.encryptionKey) {
      throw new Error("[CryptoService] Encryption key is not configured.");
    }

    return CryptoJS.enc.Base64.parse(this.encryptionKey);
  }

  private getIV(): CryptoJS.lib.WordArray {
    if (!this.encryptionIV) {
      throw new Error("[CryptoService] Encryption IV is not configured.");
    }

    return CryptoJS.enc.Base64.parse(this.encryptionIV);
  }

  // =========================================================
  // LOAD APPLICATION DATA
  // =========================================================

  /**
   * Angular equivalent:
   *
   * const decodedResponse = atob(response);
   * const parts = decodedResponse.split('|');
   * const key = parts[8];
   * const iv = parts[9];
   *
   * This method receives the raw loadApplicationData response.
   */
  configureFromApplicationData(response: string): void {
    if (!response) {
      throw new Error("[CryptoService] Empty application data response.");
    }

    try {
      const rawValue = String(response).trim();
      const unwrappedValue = rawValue
        .replace(/^"|"$/g, "")
        .replace(/^'|'$/g, "")
        .replace(/\\"/g, '"');

      const decodedResponse = this.decodeBase64ToText(unwrappedValue);

      const parts = decodedResponse.split("|");

      const key = parts[8];
      const iv = parts[9];

      if (!key || !iv) {
        throw new Error("[CryptoService] Encryption key/IV not found.");
      }

      this.configure(key, iv);

      console.log("[CryptoService] Encryption configured successfully.");
    } catch (error) {
      console.error("[CryptoService] Failed to configure encryption:", error);

      throw error;
    }
  }

  private decodeBase64ToText(value: string): string {
    const cleanedValue = value.trim();

    if (!cleanedValue) {
      throw new Error("[CryptoService] Empty Base64 payload.");
    }

    const normalizedValue = cleanedValue.replace(/-/g, "+").replace(/_/g, "/");

    const paddedValue =
      normalizedValue.length % 4 === 0
        ? normalizedValue
        : normalizedValue + "=".repeat(4 - (normalizedValue.length % 4));

    try {
      return atob(paddedValue);
    } catch {
      const fallback = cleanedValue;
      return atob(fallback);
    }
  }

  // =========================================================
  // API REQUEST ENCRYPTION
  // =========================================================

  /**
   * Angular equivalent:
   *
   * encryptPayloadsUsingAES256()
   */
  encryptPayloadsUsingAES256(body: any): string {
    if (!this.isConfigured()) {
      throw new Error("[CryptoService] Encryption is not configured.");
    }

    const sanitizedBody = this.convertDates(body);

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(sanitizedBody),
      this.getKey(),
      {
        iv: this.getIV(),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    return encrypted.toString();
  }

  // =========================================================
  // API RESPONSE DECRYPTION
  // =========================================================

  /**
   * Angular equivalent:
   *
   * decryptAPIResponseUsingAES256()
   */
  decryptAPIResponseUsingAES256(response: string): any {
    if (!this.isConfigured()) {
      throw new Error("[CryptoService] Encryption is not configured.");
    }

    if (
      response === null ||
      response === undefined ||
      String(response).trim() === ""
    ) {
      return response;
    }

    const encryptedResponse = this.unwrapEncryptedResponse(response);

    if (!encryptedResponse || !encryptedResponse.trim()) {
      return response;
    }

    // Encrypted requests can still receive a plain JSON response from
    // endpoints that do not encrypt their response body.
    const plainResponse = this.parseJsonResponse(encryptedResponse);

    if (plainResponse !== undefined) {
      return this.convertKeysToCamelCase(plainResponse);
    }

    const decryptedText = CryptoJS.AES.decrypt(
      encryptedResponse,
      this.getKey(),
      {
        iv: this.getIV(),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    ).toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error("[CryptoService] Decryption returned empty response.");
    }

    try {
      const parsedResponse = JSON.parse(decryptedText);

      /**
       * Angular behavior:
       *
       * If response is an array of strings,
       * don't convert keys.
       */
      if (
        Array.isArray(parsedResponse) &&
        parsedResponse.every((item) => typeof item === "string")
      ) {
        return parsedResponse;
      }

      return this.convertKeysToCamelCase(parsedResponse);
    } catch {
      // Response wasn't JSON.
      return decryptedText;
    }
  }

  // =========================================================
  // LOCAL STORAGE ENCRYPTION
  // =========================================================

  /**
   * Angular equivalent:
   *
   * encryptData()
   */
  encryptData(text: any): string {
    if (!this.isConfigured()) {
      throw new Error("[CryptoService] Encryption is not configured.");
    }

    const value = typeof text === "string" ? text : JSON.stringify(text);

    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(value),
      this.getKey(),
      {
        iv: this.getIV(),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    return encrypted.toString();
  }

  // =========================================================
  // LOCAL STORAGE DECRYPTION
  // =========================================================

  /**
   * Angular equivalent:
   *
   * getDecryptedData()
   */
  getDecryptedData(encryptedData: string | null): object | null {
    if (!encryptedData || !this.isConfigured()) {
      return null;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.getKey(), {
        iv: this.getIV(),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        return null;
      }

      return JSON.parse(decrypted);
    } catch (error) {
      console.error("[CryptoService] Local data decryption failed:", error);

      return null;
    }
  }

  // =========================================================
  // RESPONSE UNWRAPPER
  // =========================================================

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

  private parseJsonResponse(response: string): unknown | undefined {
    const firstCharacter = response.trim().charAt(0);

    if (firstCharacter !== "{" && firstCharacter !== "[") {
      return undefined;
    }

    try {
      return JSON.parse(response);
    } catch {
      return undefined;
    }
  }

  // =========================================================
  // CAMEL CASE CONVERSION
  // =========================================================

  /**
   * Angular equivalent:
   *
   * convertKeysToCamelCase()
   */
  convertKeysToCamelCase(data: any): any {
    // -----------------------------------------
    // ARRAY
    // -----------------------------------------

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

    // -----------------------------------------
    // OBJECT
    // -----------------------------------------

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

  // =========================================================
  // DATE CONVERSION
  // =========================================================

  /**
   * Angular equivalent:
   *
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

  // =========================================================
  // DATE FORMAT
  // =========================================================

  private formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}

export const cryptoService = new CryptoService();
