import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  async set<T>(key: string, value: T): Promise<void> {
    // Don't store undefined
    if (value === undefined) {
      await AsyncStorage.removeItem(key);
      return;
    }

    await AsyncStorage.setItem(
      key,
      JSON.stringify(value)
    );
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);

      if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "undefined"
      ) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(
        `Failed to read storage key: ${key}`,
        error
      );

      // Remove corrupted value
      await AsyncStorage.removeItem(key);

      return null;
    }
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};