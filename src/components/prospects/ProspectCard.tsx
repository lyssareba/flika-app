import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { CompatibilityBadge } from './CompatibilityBadge';
import { DealbreakersWarning } from './DealbreakersWarning';
import type { ProspectStatus } from '@/types';

interface ProspectCardProps {
  id: string;
  name: string;
  photoUri?: string;
  status: ProspectStatus;
  compatibilityScore: number | null;
  dealbreakersWithNoCount: number;
  lastDateAt?: Date;
  createdAt: Date;
  onPress: (id: string) => void;
}

/**
 * Card displaying a prospect's summary info.
 */
export const ProspectCard = ({
  id,
  name,
  photoUri,
  status,
  compatibilityScore,
  dealbreakersWithNoCount,
  lastDateAt,
  createdAt,
  onPress,
}: ProspectCardProps) => {
  const { t } = useTranslation('prospect');
  const { t: tc } = useTranslation('common');
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const subtitle = useMemo(() => {
    if (status === 'dating' && lastDateAt) {
      const relativeTime = getRelativeTime(lastDateAt, tc);
      return `${t('Last date')}: ${relativeTime}`;
    }

    const relativeTime = getRelativeTime(createdAt, tc);
    return `${t('Added')} ${relativeTime}`;
  }, [status, lastDateAt, createdAt, t, tc]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${compatibilityScore !== null ? `${compatibilityScore}% compatible` : 'still learning'}`}
    >
      {/* Photo or placeholder */}
      <View style={styles.photoContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="person" size={24} color={theme.colors.textMuted} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <CompatibilityBadge score={compatibilityScore} size="small" />
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Right side - dealbreaker warning & chevron */}
      <View style={styles.rightContainer}>
        {dealbreakersWithNoCount > 0 && (
          <DealbreakersWarning count={dealbreakersWithNoCount} compact />
        )}
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

function getRelativeTime(
  date: Date,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return t('today');
  }

  if (diffDays === 1) {
    return t('yesterday');
  }

  if (diffDays < 7) {
    return t('{{count}} days ago', { count: diffDays });
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) {
    return t('{{count}} week ago', { count: 1 });
  }

  if (diffWeeks < 4) {
    return t('{{count}} weeks ago', { count: diffWeeks });
  }

  // Fallback to date string
  return date.toLocaleDateString();
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      padding: 12,
      gap: 12,
      ...theme.shadows.sm,
    },
    photoContainer: {
      width: 48,
      height: 48,
    },
    photo: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    photoPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.traitUnknown,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoContainer: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });
