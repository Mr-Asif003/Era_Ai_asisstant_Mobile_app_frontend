import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContact, ContactsStorageData } from '../types/contact.type';

const STORAGE_KEY = '@era/contacts';
const STORAGE_VERSION = 1;

class ContactsStorage {
  async save(contacts: AppContact[]): Promise<void> {
    const data: ContactsStorageData = {
      contacts,
      lastSyncedAt: Date.now(),
      version: STORAGE_VERSION,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async load(): Promise<ContactsStorageData | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: ContactsStorageData = JSON.parse(raw);

    // Migrate or bust the cache on version mismatch
    if (data.version !== STORAGE_VERSION) {
      await this.clear();
      return null;
    }

    return data;
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Returns true if data is fresh enough (within maxAgeMs).
   * Default: 24 hours
   */
  isFresh(lastSyncedAt: number, maxAgeMs = 24 * 60 * 60 * 1000): boolean {
    return Date.now() - lastSyncedAt < maxAgeMs;
  }
}

export const contactsStorage = new ContactsStorage();