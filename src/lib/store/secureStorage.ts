import * as SecureStore from "expo-secure-store";

/**
 * redux-persist storage backed by the Android Keystore / iOS Keychain.
 *
 * Used for the `auth` slice, which holds the access token, session token
 * and user profile. AsyncStorage is plain text on disk, so it is not
 * suitable for credentials.
 *
 * SecureStore has a per-value size limit (~2 KB on iOS) and only allows
 * [A-Za-z0-9._-] in keys, so values are split into chunks.
 */
const CHUNK_SIZE = 1000;

/** The async storage contract redux-persist expects. */
interface PersistStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const toKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, "_");
const countKey = (key: string) => `${toKey(key)}__count`;
const chunkKey = (key: string, index: number) => `${toKey(key)}__${index}`;

const readCount = async (key: string): Promise<number> => {
  const raw = await SecureStore.getItemAsync(countKey(key));
  const count = raw ? Number(raw) : 0;
  return Number.isFinite(count) ? count : 0;
};

const removeChunks = async (key: string, from: number, to: number) => {
  const deletions: Promise<void>[] = [];
  for (let index = from; index < to; index += 1) {
    deletions.push(SecureStore.deleteItemAsync(chunkKey(key, index)));
  }
  await Promise.all(deletions);
};

export const secureStorage: PersistStorage = {
  async getItem(key: string) {
    const count = await readCount(key);
    if (count === 0) {
      return null;
    }

    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.getItemAsync(chunkKey(key, index)),
      ),
    );

    if (chunks.some((chunk) => chunk === null)) {
      // Partially written value (e.g. app killed mid-write): treat as empty.
      return null;
    }

    return chunks.join("");
  },

  async setItem(key: string, value: string) {
    const previousCount = await readCount(key);
    const chunks: string[] = [];

    for (let offset = 0; offset < value.length; offset += CHUNK_SIZE) {
      chunks.push(value.slice(offset, offset + CHUNK_SIZE));
    }

    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(chunkKey(key, index), chunk),
      ),
    );
    await SecureStore.setItemAsync(countKey(key), String(chunks.length));

    if (previousCount > chunks.length) {
      await removeChunks(key, chunks.length, previousCount);
    }
  },

  async removeItem(key: string) {
    const count = await readCount(key);
    await removeChunks(key, 0, count);
    await SecureStore.deleteItemAsync(countKey(key));
  },
};
