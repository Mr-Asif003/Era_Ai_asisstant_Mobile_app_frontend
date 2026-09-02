import { SyncContactsRequest, SyncContactsResponse } from '../types/contact.types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';

/**
 * Sends the user's contact phone numbers to the backend and gets back
 * which numbers are registered Era users (like WhatsApp does).
 *
 * The backend should accept a JSON body { phoneNumbers: string[] }
 * and return { registeredNumbers: string[], userMap: Record<string, string> }.
 *
 * Spring Boot endpoint: POST /api/contacts/sync
 */
export async function syncContacts(
  payload: SyncContactsRequest,
  authToken: string
): Promise<SyncContactsResponse> {
  const response = await fetch(`${BASE_URL}/contacts/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Contact sync failed [${response.status}]: ${text}`);
  }

  return response.json() as Promise<SyncContactsResponse>;
}