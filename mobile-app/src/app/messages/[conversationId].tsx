import React, { ComponentRef, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Paperclip, Send, X } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppLoader } from '@/components/ui/AppLoader';
import { AppErrorState } from '@/components/ui/AppErrorState';
import { MessageBubble } from '@/components/legal/MessageBubble';
import { DocumentUploader } from '@/components/legal/DocumentUploader';
import {
  useConversationMessages,
  useDocuments,
  useMarkConversationRead,
  useSendChatMessage
} from '@/hooks/useCustomerQueries';
import { downloadAndPreviewPrivateDocument } from '@/features/documents/privateDownload';
import { useToast } from '@/components/ui/AppToast';
import { CustomerDocument } from '@/types/customer';
import { triggerHaptic } from '@/utils/haptics';

export default function ConversationChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const { showToast } = useToast();

  const { data, isLoading, isError, refetch } = useConversationMessages(conversationId || '');
  const { data: vaultDocs } = useDocuments();
  const sendMessage = useSendChatMessage(conversationId || '');
  const markRead = useMarkConversationRead();

  const [text, setText] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState<CustomerDocument[]>([]);
  const [attachSheetOpen, setAttachSheetOpen] = useState(false);

  const conversation = data?.conversation;
  const messages = data?.messages || [];

  const unreadCount = conversation?.unreadCountCustomer;
  useEffect(() => {
    if (conversationId && unreadCount && unreadCount > 0) {
      markRead.mutate(conversationId);
    }
  }, [conversationId, unreadCount, markRead]);

  const handleSend = async () => {
    const clean = text.trim();
    if (!clean && selectedAttachments.length === 0) return;

    try {
      await sendMessage.mutateAsync({
        content: clean || undefined,
        attachmentDocIds: selectedAttachments.map((d) => d._id)
      });
      setText('');
      setSelectedAttachments([]);
      triggerHaptic.lightImpact();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    } catch {
      showToast('Failed to send message', 'error');
    }
  };

  const toggleVaultDoc = (doc: CustomerDocument) => {
    setSelectedAttachments((prev) =>
      prev.some((d) => d._id === doc._id)
        ? prev.filter((d) => d._id !== doc._id)
        : [...prev, doc]
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={conversation?.lawyerId?.fullName || 'Lawyer Conversation'}
        subtitle={
          conversation?.matterId
            ? `${conversation.matterId.matterReference} • ${conversation.matterId.title}`
            : 'Private Chat'
        }
        showBack
      />

      {isLoading ? (
        <View style={styles.center}>
          <AppLoader label="Loading conversation..." />
        </View>
      ) : isError || !conversation ? (
        <View style={styles.center}>
          <AppErrorState title="Could not load messages" onRetry={() => refetch()} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {conversation.sharedMatterSummary ? (
              <AppCard variant="sage" padding={Spacing.sm} style={styles.contextBanner}>
                <AppText variant="caption" color={Colors.primaryDeep}>
                  You shared your linked matter summary with {conversation.lawyerId?.fullName}.
                </AppText>
              </AppCard>
            ) : null}

            {messages.length === 0 ? (
              <AppCard variant="muted" padding={Spacing.md}>
                <AppText variant="bodySmall" color={Colors.textSecondary} align="center">
                  Start the conversation by typing your question or attaching a document below.
                </AppText>
              </AppCard>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  onOpenAttachment={(docId, name) =>
                    downloadAndPreviewPrivateDocument(docId, name).catch(() =>
                      showToast('Unable to open attachment', 'error')
                    )
                  }
                />
              ))
            )}
          </ScrollView>

          {selectedAttachments.length > 0 ? (
            <View style={styles.pendingAttachments}>
              {selectedAttachments.map((doc) => (
                <View key={doc._id} style={styles.pendingChip}>
                  <AppText variant="caption" color={Colors.primary} numberOfLines={1}>
                    {doc.name}
                  </AppText>
                  <Pressable onPress={() => toggleVaultDoc(doc)} hitSlop={6}>
                    <X size={14} color={Colors.primary} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
            <Pressable
              onPress={() => setAttachSheetOpen(true)}
              style={styles.attachBtn}
              accessibilityRole="button"
              accessibilityLabel="Attach document"
            >
              <Paperclip size={20} color={Colors.primary} />
            </Pressable>

            <TextInput
              style={styles.input}
              placeholder="Write a message..."
              placeholderTextColor={Colors.textMuted}
              value={text}
              onChangeText={setText}
              multiline
            />

            <Pressable
              onPress={handleSend}
              disabled={(!text.trim() && selectedAttachments.length === 0) || sendMessage.isPending}
              style={[
                styles.sendBtn,
                (!text.trim() && selectedAttachments.length === 0) || sendMessage.isPending
                  ? styles.sendDisabled
                  : undefined
              ]}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Send size={18} color={Colors.white} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      <AppBottomSheet
        visible={attachSheetOpen}
        onClose={() => setAttachSheetOpen(false)}
        title="Attach Document to Message"
      >
        <View style={styles.sheetBody}>
          <DocumentUploader
            matterId={conversation?.matterId?._id}
            documentType="Chat Attachment"
            onUploaded={(doc) => {
              setSelectedAttachments((prev) => [...prev, doc]);
              setAttachSheetOpen(false);
            }}
          />

          {vaultDocs && vaultDocs.length > 0 ? (
            <View style={styles.vaultPickList}>
              <AppText variant="label" color={Colors.textPrimary}>
                Or select from your Document Vault
              </AppText>
              {vaultDocs.slice(0, 6).map((doc) => {
                const selected = selectedAttachments.some((d) => d._id === doc._id);
                return (
                  <AppCard
                    key={doc._id}
                    variant={selected ? 'sage' : 'default'}
                    padding={Spacing.sm}
                    onPress={() => {
                      toggleVaultDoc(doc);
                      setAttachSheetOpen(false);
                    }}
                  >
                    <View style={styles.docRow}>
                      <AppText variant="bodySmall" color={Colors.textPrimary} numberOfLines={1} style={styles.flex}>
                        {doc.name}
                      </AppText>
                      <AppBadge label={selected ? 'Attached' : doc.documentType} tone="sage" />
                    </View>
                  </AppCard>
                );
              })}
            </View>
          ) : null}
        </View>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background
  },
  flex: {
    flex: 1
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg
  },
  messagesContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl
  },
  contextBanner: {
    marginBottom: Spacing.md
  },
  pendingAttachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surfaceMuted,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  pendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.sage,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    maxWidth: '75%'
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    color: Colors.textPrimary,
    fontSize: 15
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendDisabled: {
    backgroundColor: Colors.borderStrong
  },
  sheetBody: {
    gap: Spacing.md
  },
  vaultPickList: {
    gap: Spacing.xs
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs
  }
});
