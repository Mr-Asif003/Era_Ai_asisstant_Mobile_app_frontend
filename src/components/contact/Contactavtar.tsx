import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface ContactAvatarProps {
  name: string;
  initials: string;
  avatarUri?: string | null;
  size?: number;
  isRegistered?: boolean;
}

const PALETTE = [
  '#6366f1', // violet
  '#0ea5e9', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // purple
  '#f97316', // orange
  '#14b8a6', // teal
];

function pickColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export const ContactAvatar = memo<ContactAvatarProps>(
  ({ name, initials, avatarUri, size = 48, isRegistered = false }) => {
    const bgColor = pickColor(name);
    const fontSize = size * 0.38;
    const badgeSize = size * 0.28;

    return (
      <View style={{ width: size, height: size }}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
            ]}
          >
            <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
          </View>
        )}

        {isRegistered && (
          <View
            style={[
              styles.badge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
                bottom: 0,
                right: 0,
              },
            ]}
          />
        )}
      </View>
    );
  }
);

ContactAvatar.displayName = 'ContactAvatar';

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#e5e7eb',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#09090b', // matches dark background
  },
});