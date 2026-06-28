import * as Contacts from "expo-contacts";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export async function requestContactsPermission() {
  const { status } =
    await Contacts.requestPermissionsAsync();

  return status === "granted";
}

export async function getDeviceContacts() {
  const granted =
    await requestContactsPermission();

  if (!granted) {
    throw new Error(
      "Contacts permission denied"
    );
  }

  const { data } =
    await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.PhoneNumbers,
      ],
    });

  return data;
}

export async function getContactNumbers() {
  const contacts =
    await getDeviceContacts();

  const numbers = new Set<string>();

  contacts.forEach((contact) => {
    contact.phoneNumbers?.forEach(
      (phone) => {
        try {
          const parsed =
            parsePhoneNumberFromString(
              phone.number,
              "IN"
            );

          if (parsed?.isValid()) {
            numbers.add(parsed.number);
          }
        } catch {}
      }
    );
  });

  return [...numbers];
}