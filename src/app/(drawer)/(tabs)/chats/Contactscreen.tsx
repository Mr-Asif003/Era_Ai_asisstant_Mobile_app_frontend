import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useContacts } from '../../../../hooks/useContacts';
import { ContactItem } from '../../../../components/contact/Contactitem';
import { ContactSearch } from '../../../../components/contact/Contactsearch';
import { AppContact, ContactSection } from '../../../../types/contact.type';

import {
  Modal,
  TextInput,
} from "react-native";
import { router } from "expo-router";
interface ContactScreenProps {
  authToken: string;
  onSelectContact?: (contact: AppContact) => void;
}

export default function ContactScreen({
  authToken,
  onSelectContact,
}: ContactScreenProps) {
  const {
    sections,
    registeredContacts,
    searchQuery,
    isLoading,
    isSyncing,
    error,
    isPermissionGranted,
    permissionStatus,
    setSearchQuery,
    refresh,
    requestPermission,
    openSettings,
  } = useContacts({ authToken });


//   const handleSelectContact = useCallback(
//   (contact: AppContact) => {
//     if (!contact.isRegistered) {
//       Alert.alert(
//         "Not on Era",
//         `${contact.name} is not registered on Era.`
//       );
//       console.log(`Contact ${contact.name} (${contact.primaryPhone}) is not registered on Era.`);
//       return;
//     }

//     createDirectConversation.mutate(
//       {
//         number: contact.primaryPhone,
//       },
//       {
//         onSuccess: (conversation) => {
//           router.push(`/chat/${conversation.id}`);
//         },
//         onError: (error: any) => {
//           Alert.alert(
//             "Error",
//             error?.response?.data?.message ?? "Failed to start chat."
//           );
//         },
//       }
//     );
//   },
//   [createDirectConversation]
// );

const [showCreateModal, setShowCreateModal] = useState(false);
const [number, setNumber] = useState("");

const handleCreateChat = () => {
  // if (!number.trim()) {
  //   Alert.alert("Number required", "Please enter a mobile number.");
  //   console.log("Attempted to create chat with empty number.");
  //   return;
  // }

  // createDirectConversation.mutate(
  //   { number: number.trim() },
  //   {
  //     onSuccess: (conversation) => {
  //       setShowCreateModal(false);
  //       setNumber("");

  //       router.push(`/chat/${conversation.id}`);
  //     },
  //     onError: (error: any) => {
  //       Alert.alert(
  //         "Error",
  //         error?.response?.data?.message ?? "Failed to start chat."
  //       );
  //       console.error("Failed to create direct conversation:", error);
  //     },
  //   }
  // );
  Alert.alert("Feature not implemented", "Starting a chat by number is not yet implemented.");
  console.log("Starting a chat by number is not yet implemented.");
}; 


  // ── Permission gate ────────────────────────────────────────────────────────
  if (isPermissionGranted) {
    return (
      <View style={styles.gateContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#09090b" />
        <Ionicons name="people-outline" size={64} color="#6366f1" />
        <Text style={styles.gateTitle}>Access your contacts</Text>
        <Text style={styles.gateBody}>
          Era needs permission to read your contacts so you can see which of
          your friends are already on the app.
        </Text>
        {permissionStatus === 'denied' ? (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={openSettings}>
              <Text style={styles.primaryBtnText}>Open Settings</Text>
            </TouchableOpacity>
            <Text style={styles.gateHint}>
              Enable "Contacts" in your app settings to continue.
            </Text>
          </>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Allow access</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading contacts…</Text>
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={refresh}>
          <Text style={styles.primaryBtnText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main list ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
        {isSyncing && (
          <ActivityIndicator size="small" color="#6366f1" style={{ marginLeft: 8 }} />
        )}
      </View>

      {/* Registered contacts strip */}
      {registeredContacts.length > 0 && !searchQuery && (
        <View style={styles.registeredBanner}>
          <Text style={styles.registeredLabel}>
            {registeredContacts.length} friend
            {registeredContacts.length !== 1 ? 's' : ''} on Era
          </Text>
        </View>
      )}

      <ContactSearch value={searchQuery} onChangeText={setSearchQuery} />

      <SectionList<AppContact, ContactSection>
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactItem contact={item} onPress={handleSelectContact} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={refresh}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={40} color="#3f3f46" />
            <Text style={styles.emptyText}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No contacts found'}
            </Text>
          </View>
        }
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
  style={styles.fab}
  onPress={() => setShowCreateModal(true)}
>
  <Ionicons name="add" color="#fff" size={30} />
</TouchableOpacity>

<Modal
  visible={showCreateModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowCreateModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>Start New Chat</Text>

      <TextInput
        value={number}
        onChangeText={setNumber}
        keyboardType="phone-pad"
        placeholder="Enter mobile number"
        placeholderTextColor="#777"
        style={styles.input}
      />

      <View style={styles.modalButtons}>
        <TouchableOpacity
          onPress={() => {
            setShowCreateModal(false);
            setNumber("");
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startButton}
          disabled={createDirectConversation.isPending}
          onPress={handleCreateChat}
        >
          {createDirectConversation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startText}>Start</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 12 : 0,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#09090b',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fafafa',
    letterSpacing: -0.5,
    flex: 1,
  },
  registeredBanner: {
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  registeredLabel: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    backgroundColor: '#09090b',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: '#18181b',
    marginLeft: 74,
  },
  listContent: {
    paddingBottom: 80,
  },
  // ── States ──────────────────────────────────────────────────────────────────
  centerContainer: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    color: '#71717a',
    fontSize: 14,
    marginTop: 8,
  },
  errorTitle: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '600',
  },
  errorBody: {
    color: '#71717a',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: '#52525b',
    fontSize: 15,
  },
  // ── Permission gate ─────────────────────────────────────────────────────────
  gateContainer: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    gap: 16,
  },
  gateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fafafa',
    textAlign: 'center',
  },
  gateBody: {
    fontSize: 15,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 22,
  },
  gateHint: {
    fontSize: 13,
    color: '#52525b',
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // ── FAB ─────────────────────────────────────────────────────────────────────
  fab: {
  position: "absolute",
  bottom: 24,
  right: 20,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#6366f1",
  justifyContent: "center",
  alignItems: "center",
  elevation: 8,
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},

modal: {
  width: "88%",
  backgroundColor: "#18181b",
  borderRadius: 16,
  padding: 20,
},

modalTitle: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 16,
},

input: {
  height: 50,
  backgroundColor: "#27272a",
  borderRadius: 10,
  color: "#fff",
  paddingHorizontal: 16,
},

modalButtons: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 20,
},

cancelText: {
  color: "#a1a1aa",
  fontSize: 16,
  marginRight: 20,
},

startButton: {
  backgroundColor: "#6366f1",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
},

startText: {
  color: "#fff",
  fontWeight: "700",
},
});