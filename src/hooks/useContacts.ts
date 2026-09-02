import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppContact, ContactSection } from '../types/contact.type';
import { contactsRepository } from '../repository/contacts.repository';
import { contactsService } from '../services/contactsService';
import { permissionService } from '../services/permission.service';
import { useContactPermission } from './useContactPermission';

interface UseContactsOptions {
  authToken: string;
  autoLoad?: boolean;
}

interface UseContactsReturn {
  contacts: AppContact[];
  filteredContacts: AppContact[];
  sections: ContactSection[];
  registeredContacts: AppContact[];
  searchQuery: string;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  permissionStatus: ReturnType<typeof useContactPermission>['permissionStatus'];
  isPermissionGranted: boolean;
  setSearchQuery: (q: string) => void;
  loadContacts: () => Promise<void>;
  refresh: () => Promise<void>;
  requestPermission: () => Promise<void>;
  openSettings: () => void;
}

export function useContacts({
  authToken,
  autoLoad = true,
}: UseContactsOptions): UseContactsReturn {
  const [contacts, setContacts] = useState<AppContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { permissionStatus, isGranted, requestPermission, openSettings } =
    useContactPermission();

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contactsRepository.getContacts(authToken);
      setContacts(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  const refresh = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const data = await contactsRepository.refreshContacts(authToken);
      setContacts(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to refresh contacts');
    } finally {
      setIsSyncing(false);
    }
  }, [authToken]);

  const handleRequestPermission = useCallback(async () => {
    const status = await requestPermission();
    if (status === 'granted') {
      await loadContacts();
    }
  }, [requestPermission, loadContacts]);

  // Auto-load on mount
  useEffect(() => {
    if (!autoLoad) return;
    (async () => {
      const status = await permissionService.getPermissionStatus();
      if (status === 'granted') {
        await loadContacts();
      }
    })();
  }, [autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredContacts = useMemo(
    () => contactsService.search(contacts, searchQuery),
    [contacts, searchQuery]
  );

  const sections = useMemo(
    () => contactsService.groupAlphabetically(filteredContacts),
    [filteredContacts]
  );

  const registeredContacts = useMemo(
    () => contacts.filter((c) => c.isRegistered),
    [contacts]
  );

  return {
    contacts,
    filteredContacts,
    sections,
    registeredContacts,
    searchQuery,
    isLoading,
    isSyncing,
    error,
    permissionStatus,
    isPermissionGranted: isGranted,
    setSearchQuery,
    loadContacts,
    refresh,
    requestPermission: handleRequestPermission,
    openSettings,
  };
}