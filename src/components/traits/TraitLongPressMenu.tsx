import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { Trait, TraitState } from '@/types';

interface TraitLongPressMenuProps {
  visible: boolean;
  trait: Trait | null;
  onSelect: (state: TraitState) => void;
  onClose: () => void;
}

export const TraitLongPressMenu: React.FC<TraitLongPressMenuProps> = ({
  visible,
  trait,
  onSelect,
  onClose,
}) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('traits');
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  if (!trait) return null;

  const isDealbreaker = trait.attributeCategory === 'dealbreaker';

  const handleSelect = (state: TraitState) => {
    onSelect(state);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.menuContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header with trait name */}
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {trait.attributeName}
              {isDealbreaker && <Text style={styles.dealbreaker}> ★</Text>}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {/* Yes */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                trait.state === 'yes' && styles.optionButtonActiveYes,
              ]}
              onPress={() => handleSelect('yes')}
              accessibilityRole="button"
              accessibilityLabel={t('Yes')}
              accessibilityState={{ selected: trait.state === 'yes' }}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={
                  trait.state === 'yes'
                    ? theme.colors.traitYesText
                    : theme.colors.success
                }
              />
              <Text
                style={[
                  styles.optionText,
                  trait.state === 'yes' && styles.optionTextActiveYes,
                ]}
              >
                {t('Yes')}
              </Text>
            </TouchableOpacity>

            {/* No */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                trait.state === 'no' && styles.optionButtonActiveNo,
              ]}
              onPress={() => handleSelect('no')}
              accessibilityRole="button"
              accessibilityLabel={t('No')}
              accessibilityState={{ selected: trait.state === 'no' }}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={
                  trait.state === 'no'
                    ? theme.colors.traitNoText
                    : theme.colors.error
                }
              />
              <Text
                style={[
                  styles.optionText,
                  trait.state === 'no' && styles.optionTextActiveNo,
                ]}
              >
                {t('No')}
              </Text>
            </TouchableOpacity>

            {/* Reset to Unknown */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                trait.state === 'unknown' && styles.optionButtonActiveUnknown,
              ]}
              onPress={() => handleSelect('unknown')}
              accessibilityRole="button"
              accessibilityLabel={t('Reset to unknown')}
              accessibilityState={{ selected: trait.state === 'unknown' }}
            >
              <View style={styles.unknownIcon}>
                <Text style={styles.unknownIconText}>?</Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  trait.state === 'unknown' && styles.optionTextActiveUnknown,
                ]}
              >
                {t('Reset to unknown')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    menuContainer: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      width: '100%',
      maxWidth: 320,
      overflow: 'hidden',
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      alignItems: 'center',
    },
    headerText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    dealbreaker: {
      color: theme.colors.warning,
    },
    optionsContainer: {
      padding: 8,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 8,
      gap: 12,
      minHeight: 56,
    },
    optionButtonActiveYes: {
      backgroundColor: theme.colors.traitYes,
    },
    optionButtonActiveNo: {
      backgroundColor: theme.colors.traitNo,
    },
    optionButtonActiveUnknown: {
      backgroundColor: theme.colors.traitUnknown,
    },
    optionText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    optionTextActiveYes: {
      color: theme.colors.traitYesText,
    },
    optionTextActiveNo: {
      color: theme.colors.traitNoText,
    },
    optionTextActiveUnknown: {
      color: theme.colors.traitUnknownText,
    },
    unknownIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unknownIconText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.backgroundCard,
    },
  });
