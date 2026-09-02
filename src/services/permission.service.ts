import * as Contacts from 'expo-contacts';
import { ContactPermissionStatus } from '../types/contact.type';

class PermissionService {
  /**
   * Get current contacts permission status without prompting
   */
  async getPermissionStatus(): Promise<ContactPermissionStatus> {
    const { status } = await Contacts.getPermissionsAsync();
    return this.mapStatus(status);
  }

  /**
   * Request contacts permission from the user
   */
  async requestPermission(): Promise<ContactPermissionStatus> {
    const { status } = await Contacts.requestPermissionsAsync();
    return this.mapStatus(status);
  }

  /**
   * Returns true only if permission is fully granted
   */
  async isGranted(): Promise<boolean> {
    const status = await this.getPermissionStatus();
    return status === 'granted';
  }

  private mapStatus(status: Contacts.PermissionStatus): ContactPermissionStatus {
    switch (status) {
      case Contacts.PermissionStatus.GRANTED:
        return 'granted';
      case Contacts.PermissionStatus.DENIED:
        return 'denied';
      case Contacts.PermissionStatus.UNDETERMINED:
        return 'undetermined';
      default:
        return 'undetermined';
    }
  }
}

export const permissionService = new PermissionService();