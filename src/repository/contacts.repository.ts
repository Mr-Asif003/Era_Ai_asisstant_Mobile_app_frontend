import { AppContact } from '../types/contact.type';
import { contactsService } from '../services/contactsService';
import { contactsStorage } from '../storage/contacts.storage';
import { syncContacts } from '../backend/api/contacts.api';
import { phoneService } from '../services/phone.service';

class ContactsRepository {
  /**
   * Load contacts:
   * 1. Return cached data immediately if fresh
   * 2. Otherwise fetch from device + sync with server
   */
  async getContacts(authToken: string, forceRefresh = false): Promise<AppContact[]> {
    if (!forceRefresh) {
      const cached = await contactsStorage.load();
      if (cached && contactsStorage.isFresh(cached.lastSyncedAt)) {
        return cached.contacts;
      }
    }

    return this.refreshContacts(authToken);
  }

  /**
   * Full refresh: fetch device → sync with server → persist → return
   */
  async refreshContacts(authToken: string): Promise<AppContact[]> {
    // 1. Get raw device contacts
    let contacts = await contactsService.fetchDeviceContacts();

    // 2. Collect all phone numbers for server sync
    const allNumbers = phoneService.normalizeMany(
      contacts.flatMap((c) => c.phoneNumbers.map((p) => p.number))
    );

    // 3. Ask backend which numbers are registered users
    try {
      const { registeredNumbers, userMap } = await syncContacts(
        { phoneNumbers: allNumbers },
        authToken
      );

      const registeredSet = new Set(registeredNumbers);

      // 4. Annotate contacts with registration status
      contacts = contacts.map((contact) => {
        const matchedPhone = contact.phoneNumbers.find((p) =>
          registeredSet.has(p.number)
        );
        return {
          ...contact,
          isRegistered: !!matchedPhone,
          registeredUserId: matchedPhone
            ? userMap[matchedPhone.number]
            : undefined,
        };
      });
    } catch (e) {
      // Server sync failure is non-fatal; show contacts without registration info
      console.warn('[ContactsRepository] Server sync failed:', e);
    }

    // 5. Persist and return
    await contactsStorage.save(contacts);
    return contacts;
  }

  clearCache(): Promise<void> {
    return contactsStorage.clear();
  }
}

export const contactsRepository = new ContactsRepository();