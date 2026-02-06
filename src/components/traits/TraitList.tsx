import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { Trait } from '@/types';

interface TraitListProps {
  traits: Trait[];
  onTraitPress: (traitId: string) => void;
}

interface SectionData {
  title: string;
  icon: 'checkmark-circle' | 'close-circle';
  iconColor: string;
  data: Trait[];
}

export const TraitList: React.FC<TraitListProps> = ({ traits, onTraitPress }) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('traits');
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const yesTraits = traits.filter((t) => t.state === 'yes');
  const noTraits = traits.filter((t) => t.state === 'no');

  const sections: SectionData[] = [];

  if (yesTraits.length > 0) {
    sections.push({
      title: t('Yes'),
      icon: 'checkmark-circle',
      iconColor: theme.colors.traitYesText,
      data: yesTraits,
    });
  }

  if (noTraits.length > 0) {
    sections.push({
      title: t('No'),
      icon: 'close-circle',
      iconColor: theme.colors.traitNoText,
      data: noTraits,
    });
  }

  const renderItem = ({ item }: { item: Trait }) => {
    const isDealbreaker = item.attributeCategory === 'dealbreaker';
    const isYes = item.state === 'yes';

    return (
      <TouchableOpacity
        style={[
          styles.traitItem,
          isYes ? styles.traitItemYes : styles.traitItemNo,
        ]}
        onPress={() => onTraitPress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.attributeName}, ${item.state}. ${t('Tap any trait to reset to unknown')}`}
      >
        <View style={styles.traitContent}>
          <Text style={styles.traitName}>
            {item.attributeName}
            {isDealbreaker && <Text style={styles.dealbreaker}> ★</Text>}
          </Text>
        </View>
        <Ionicons
          name="refresh"
          size={18}
          color={theme.colors.textMuted}
          style={styles.resetIcon}
        />
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={section.icon} size={20} color={section.iconColor} />
      <Text style={[styles.sectionTitle, { color: section.iconColor }]}>
        {section.title}
      </Text>
      <Text style={styles.sectionCount}>({section.data.length})</Text>
    </View>
  );

  if (sections.length === 0) {
    return null;
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 4,
      gap: 8,
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
    },
    sectionCount: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    traitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    traitItemYes: {
      backgroundColor: theme.colors.traitYes + '40',
    },
    traitItemNo: {
      backgroundColor: theme.colors.traitNo + '40',
    },
    traitContent: {
      flex: 1,
    },
    traitName: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    dealbreaker: {
      color: theme.colors.warning,
    },
    resetIcon: {
      marginLeft: 8,
    },
  });
