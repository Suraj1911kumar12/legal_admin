import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radii, Spacing } from '@/theme/tokens';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppAvatar } from '../ui/AppAvatar';
import { AppBadge } from '../ui/AppBadge';
import { CustomerConversation } from '@/types/customer';
import { formatDateTime } from '@/utils/formatters';

export interface ConversationCardProps {
  conversation: CustomerConversation;
  onPress: () => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onPress
}) => {
  const unread = conversation.unreadCountCustomer > 0;

  return (
    <AppCard
      onPress={onPress}
      variant={unread ? 'sage' : 'default'}
      accessibilityLabel={`Conversation with ${conversation.lawyerId?.fullName || 'Lawyer'}`}
    >
      <View style={styles.row}>
        <AppAvatar
          name={conversation.lawyerId?.fullName || 'Lawyer'}
          uri={conversation.lawyerId?.profileImage}
          size={46}
        />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <AppText variant="subtitle" color={Colors.textPrimary} numberOfLines={1} style={styles.name}>
              {conversation.lawyerId?.fullName || 'Verified Lawyer'}
            </AppText>
            <AppText variant="caption" color={Colors.textMuted}>
              {formatDateTime(conversation.lastMessageAt)}
            </AppText>
          </View>

          {conversation.matterId ? (
            <AppText variant="caption" color={Colors.primary} numberOfLines={1}>
              {conversation.matterId.matterReference} • {conversation.matterId.title}
            </AppText>
          ) : null}

          <View style={styles.bottomRow}>
            <AppText
              variant="bodySmall"
              color={unread ? Colors.textPrimary : Colors.textSecondary}
              weight={unread ? 'semibold' : 'regular'}
              numberOfLines={1}
              style={styles.preview}
            >
              {conversation.lastMessage || 'No messages yet — tap to start'}
            </AppText>
            {unread ? (
              <AppBadge
                label={String(conversation.unreadCountCustomer)}
                tone="primary"
                style={styles.unreadBadge}
              />
            ) : null}
          </View>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm
  },
  content: {
    flex: 1,
    gap: 2
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs
  },
  name: {
    flex: 1
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: 2
  },
  preview: {
    flex: 1
  },
  unreadBadge: {
    borderRadius: Radii.pill
  }
});

