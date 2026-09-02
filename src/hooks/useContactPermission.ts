import { useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { ContactPermissionStatus } from '../types/contact.type';
import { permissionService } from '../services/permission.service';

interface UseContactPermissionReturn {
  permissionStatus: ContactPermissionStatus;
  isGranted: boolean;
  requestPermission: () => Promise<ContactPermissionStatus>;
  openSettings: () => void;
}

export function useContactPermission(
  initialStatus: ContactPermissionStatus = 'undetermined'
): UseContactPermissionReturn {
  const [permissionStatus, setPermissionStatus] =
    useState<ContactPermissionStatus>(initialStatus);

  const requestPermission = useCallback(async (): Promise<ContactPermissionStatus> => {
    const status = await permissionService.requestPermission();
    setPermissionStatus(status);
    return status;
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return {
    permissionStatus,
    isGranted: permissionStatus === 'granted',
    requestPermission,
    openSettings,
  };
}