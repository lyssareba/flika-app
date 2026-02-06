import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';

type TabType = 'toEvaluate' | 'evaluated';

interface TraitTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  toEvaluateCount: number;
  evaluatedCount: number;
}

export const TraitTabs: React.FC<TraitTabsProps> = ({
  activeTab,
  onTabChange,
  toEvaluateCount,
  evaluatedCount,
}) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('traits');
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'toEvaluate' && styles.activeTab]}
        onPress={() => onTabChange('toEvaluate')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'toEvaluate' }}
      >
        <Text
          style={[styles.tabText, activeTab === 'toEvaluate' && styles.activeTabText]}
        >
          {t('To Evaluate')}
        </Text>
        <View
          style={[
            styles.countBadge,
            activeTab === 'toEvaluate' && styles.activeCountBadge,
          ]}
        >
          <Text
            style={[
              styles.countText,
              activeTab === 'toEvaluate' && styles.activeCountText,
            ]}
          >
            {toEvaluateCount}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'evaluated' && styles.activeTab]}
        onPress={() => onTabChange('evaluated')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'evaluated' }}
      >
        <Text
          style={[styles.tabText, activeTab === 'evaluated' && styles.activeTabText]}
        >
          {t('Evaluated')}
        </Text>
        <View
          style={[
            styles.countBadge,
            activeTab === 'evaluated' && styles.activeCountBadge,
          ]}
        >
          <Text
            style={[
              styles.countText,
              activeTab === 'evaluated' && styles.activeCountText,
            ]}
          >
            {evaluatedCount}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      gap: 8,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: theme.colors.textOnPrimary,
    },
    countBadge: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 24,
      alignItems: 'center',
    },
    activeCountBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    countText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    activeCountText: {
      color: theme.colors.textOnPrimary,
    },
  });
