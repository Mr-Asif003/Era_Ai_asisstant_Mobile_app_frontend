import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppContact } from '../../types/contact.type';
import { ContactAvatar } from '../../components/contact/Contactavtar';
import { phoneService } from '../../services/phone.service';

interface ContactItemProps {
  contact: AppContact;
  onPress: (contact: AppContact) => void;
  onLongPress?: (contact: AppContact) => void;
}

export const ContactItem = memo<ContactItemProps>(
  ({ contact, onPress, onLongPress }) => {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress(contact)}
        onLongPress={onLongPress ? () => onLongPress(contact) : undefined}
        activeOpacity={0.65}
      >
        <ContactAvatar
          name={contact.name}
          initials={contact.initials}
          avatarUri={contact.avatarUri}
          size={46}
          isRegistered={contact.isRegistered}
        />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {contact.name}
          </Text>
          <Text style={styles.phone} numberOfLines={1}>
            {contact.isRegistered
              ? phoneService.format(contact.primaryPhone)
              : phoneService.format(contact.primaryPhone)}
          </Text>
        </View>

        {contact.isRegistered && (
          <View style={styles.chip}>
            <Text style={styles.chipText}>On Era</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

ContactItem.displayName = 'ContactItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: '#09090b',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fafafa',
    letterSpacing: 0.1,
  },
  phone: {
    fontSize: 13,
    color: '#71717a',
  },
  chip: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#818cf8',
    letterSpacing: 0.3,
  },
});