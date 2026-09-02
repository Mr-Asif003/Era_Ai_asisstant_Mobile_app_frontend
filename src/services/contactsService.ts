import * as Contacts from 'expo-contacts';
import { AppContact, RawContact, PhoneNumber } from '../types/contact.type';
import { phoneService } from './phone.service';

class ContactsService {
  /**
   * Fetch all device contacts that have at least one phone number.
   */
  async fetchDeviceContacts(): Promise<AppContact[]> {
    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.FirstName,
        Contacts.Fields.LastName,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Image,
        Contacts.Fields.Company,
        Contacts.Fields.JobTitle,
      ],
      sort: Contacts.SortTypes.FirstName,
    });

    const raw = data as unknown as RawContact[];

    return raw
      .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
      .map((c) => this.transform(c))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Map a raw expo-contacts contact to our AppContact shape.
   */
  private transform(raw: RawContact): AppContact {
    const phones: PhoneNumber[] = (raw.phoneNumbers ?? []).map((p) => ({
      label: p.label ?? 'mobile',
      number: phoneService.normalize(p.number ?? ''),
      isPrimary: false,
    }));

    // Mark the first mobile number (or just first) as primary
    const primaryIdx =
      phones.findIndex((p) => p.label === 'mobile') !== -1
        ? phones.findIndex((p) => p.label === 'mobile')
        : 0;

    if (phones[primaryIdx]) phones[primaryIdx].isPrimary = true;

    return {
      id: raw.id,
      name: raw.name ?? `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim(),
      firstName: raw.firstName,
      lastName: raw.lastName,
      initials: this.getInitials(raw),
      primaryPhone: phones[primaryIdx]?.number ?? '',
      phoneNumbers: phones,
      emails: raw.emails ?? [],
      avatarUri: raw.imageAvailable && raw.image ? raw.image.uri : null,
      isRegistered: false, // will be set after server sync
      company: raw.company,
      lastSynced: Date.now(),
    };
  }

  private getInitials(raw: RawContact): string {
    const first = raw.firstName?.[0] ?? '';
    const last = raw.lastName?.[0] ?? '';
    if (first || last) return `${first}${last}`.toUpperCase();
    // fallback: first two chars of full name
    return (raw.name ?? '??').slice(0, 2).toUpperCase();
  }

  /**
   * Filter contacts locally by query string (name or phone).
   */
  search(contacts: AppContact[], query: string): AppContact[] {
    const q = query.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.primaryPhone.includes(q) ||
        c.phoneNumbers.some((p) => p.number.includes(q))
    );
  }

  /**
   * Group contacts into alphabetical sections for SectionList.
   */
  groupAlphabetically(contacts: AppContact[]) {
    const map: Record<string, AppContact[]> = {};
    for (const contact of contacts) {
      const letter = (contact.name[0] ?? '#').toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      if (!map[key]) map[key] = [];
      map[key].push(contact);
    }
    return Object.keys(map)
      .sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
      .map((title) => ({ title, data: map[title] }));
  }
}

export const contactsService = new ContactsService();