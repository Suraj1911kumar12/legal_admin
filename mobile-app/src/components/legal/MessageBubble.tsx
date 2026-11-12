import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Paperclip, CheckCheck } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppText } from '../ui/AppText';
import { ChatMessage } from '@/types/customer';
import { formatDateTime } from '@/utils/formatters';

export interface MessageBubbleProps {
  message: ChatMessage;
  onOpenAttachment?: (documentId: string, name: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onOpenAttachment
}) => {
  const isMe = message.senderType === 'customer';

  return (
    <View style={[styles.row, isMe ? styles.rowEnd : styles.rowStart]}>
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
        {!isMe ? (
          <AppText variant="caption" weight="semibold" color={Colors.primary} style={styles.sender}>
            {message.senderName}
          </AppText>
        ) : null}

        {message.content ? (
          <AppText variant="body" color={isMe ? Colors.white : Colors.textPrimary}>
            {message.content}
          </AppText>
        ) : null}

        {message.attachments && message.attachments.length > 0 ? (
          <View style={styles.attachments}>
            {message.attachments.map((att, idx) => (
              <Pressable
                key={`${att.documentId || idx}-${att.name}`}
                onPress={() => {
                  if (att.documentId && onOpenAttachment) {
                    onOpenAttachment(att.documentId, att.name);
                  }
                }}
                style={[styles.attachmentChip, isMe ? styles.myAttachment : styles.theirAttachment]}
              >
                <Paperclip size={13} color={isMe ? Colors.white : Colors.primary} />
                <AppText
                  variant="caption"
                  color={isMe ? Colors.white : Colors.primary}
                  numberOfLines={1}
                  style={styles.attachmentText}
                >
                  {att.name}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.meta}>
          <AppText
            variant="caption"
            color={isMe ? 'rgba(255,255,255,0.72)' : Colors.textMuted}
          >
            {formatDateTime(message.createdAt)}
          </AppText>
          {isMe && message.readAt ? (
            <CheckCheck size={13} color="rgba(255,255,255,0.8)" />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.sm
  },
  rowEnd: {
    justifyContent: 'flex-end'
  },
  rowStart: {
    justifyContent: 'flex-start'
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4
  },
  theirBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4
  },
  sender: {
    marginBottom: 2
  },
  attachments: {
    marginTop: Spacing.xs,
    gap: 6
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 5
  },
  myAttachment: {
    backgroundColor: 'rgba(255,255,255,0.16)'
  },
  theirAttachment: {
    backgroundColor: Colors.sageLight
  },
  attachmentText: {
    flexShrink: 1
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4
  }
});

