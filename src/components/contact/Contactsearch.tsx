import React, { memo, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ArrowBigLeftIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ContactSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  inputProps?: TextInputProps;
}

export const ContactSearch = memo<ContactSearchProps>(
  ({
    value,
    onChangeText,
    placeholder = 'Search contacts',
    inputProps,
  }) => {
    const inputRef = useRef<TextInput>(null);

    const router=useRouter();
const handleBackPress = () => {
  // Implement your back navigation logic here
  console.log('Back button pressed');
  router.replace("/chats");

}
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity onPress={handleBackPress} style={{ marginBottom: 8 }  }>
            <ArrowBigLeftIcon color="#71717a" size={32} />
        </TouchableOpacity>
        <View style={styles.container}>
          <Ionicons name="search" size={18} color="#71717a" style={styles.icon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#52525b"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="never" // we render our own
            {...inputProps}
          />
          {value.length > 0 && (
            <TouchableOpacity
              onPress={() => onChangeText('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#71717a" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

ContactSearch.displayName = 'ContactSearch';

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#09090b',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    color: '#fafafa',
    fontSize: 15,
    lineHeight: 20,
    padding: 0, // remove Android default
  },
});