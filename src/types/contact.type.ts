export interface PhoneNumber {
  label: string; // 'mobile' | 'home' | 'work' | 'other'
  number: string;
  isPrimary?: boolean;
}

export interface EmailAddress {
  label: string;
  email: string;
}

export interface RawContact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers: PhoneNumber[];
  emails: EmailAddress[];
  imageAvailable: boolean;
  image?: { uri: string } | null;
  company?: string;
  jobTitle?: string;
}

export interface AppContact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  initials: string;
  primaryPhone: string;
  phoneNumbers: PhoneNumber[];
  emails: EmailAddress[];
  avatarUri?: string | null;
  isRegistered: boolean; // whether this contact uses your app
  registeredUserId?: string;
  company?: string;
  lastSynced: number; // timestamp
}

export interface ContactsState {
  contacts: AppContact[];
  filteredContacts: AppContact[];
  searchQuery: string;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  permissionStatus: ContactPermissionStatus;
  lastSyncedAt: number | null;
}

export type ContactPermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'limited';

export interface ContactSection {
  title: string;
  data: AppContact[];
}

export interface SyncContactsRequest {
  phoneNumbers: string[];
}

export interface SyncContactsResponse {
  registeredNumbers: string[]; // normalized phone numbers that have accounts
  userMap: Record<string, string>; // normalized phone -> userId
}

export interface ContactsStorageData {
  contacts: AppContact[];
  lastSyncedAt: number;
  version: number;
}