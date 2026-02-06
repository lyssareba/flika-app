import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, type Theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { Trait, TraitState } from '@/types';

interface TraitCheckboxRowProps {
  trait: Trait;
  onStateChange: (traitId: string, state: TraitState) => void;
}

const BUTTON_SIZE = 44; // Minimum touch target for accessibility

export const TraitCheckboxRow: React.FC<TraitCheckboxRowProps> = ({
  trait,
  onStateChange,
}) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation('traits');
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const isDealbreaker = trait.attributeCategory === 'dealbreaker';

  const handleStateChange = useCallback(
    (newState: TraitState) => {
      if (trait.state !== newState) {
        onStateChange(trait.id, newState);
      }
    },
    [trait.id, trait.state, onStateChange]
  );

  const getStateLabel = (state: TraitState): string => {
    switch (state) {
      case 'yes':
        return t('Yes');
      case 'no':
        return t('No');
      default:
        return t('Unknown');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          {isDealbreaker && (
            <Text style={styles.dealbreaker}>★ </Text>
          )}
          <Text style={styles.traitName}>{trait.attributeName}</Text>
        </View>
        <View style={styles.buttonsContainer}>
          {/* Unknown button */}
          <TouchableOpacity
            style={[
              styles.stateButton,
              trait.state === 'unknown' && styles.stateButtonActiveUnknown,
            ]}
            onPress={() => handleStateChange('unknown')}
            accessibilityRole="radio"
            accessibilityState={{ checked: trait.state === 'unknown' }}
            accessibilityLabel={`${getStateLabel('unknown')} for ${trait.attributeName}`}
          >
            <Text
              style={[
                styles.stateButtonText,
                trait.state === 'unknown' && styles.stateButtonTextActive,
              ]}
            >
              ?
            </Text>
          </TouchableOpacity>

          {/* Yes button */}
          <TouchableOpacity
            style={[
              styles.stateButton,
              trait.state === 'yes' && styles.stateButtonActiveYes,
            ]}
            onPress={() => handleStateChange('yes')}
            accessibilityRole="radio"
            accessibilityState={{ checked: trait.state === 'yes' }}
            accessibilityLabel={`${getStateLabel('yes')} for ${trait.attributeName}`}
          >
            <Ionicons
              name="checkmark"
              size={18}
              color={
                trait.state === 'yes'
                  ? theme.colors.traitYesText
                  : theme.colors.textMuted
              }
            />
          </TouchableOpacity>

          {/* No button */}
          <TouchableOpacity
            style={[
              styles.stateButton,
              trait.state === 'no' && styles.stateButtonActiveNo,
            ]}
            onPress={() => handleStateChange('no')}
            accessibilityRole="radio"
            accessibilityState={{ checked: trait.state === 'no' }}
            accessibilityLabel={`${getStateLabel('no')} for ${trait.attributeName}`}
          >
            <Ionicons
              name="close"
              size={18}
              color={
                trait.state === 'no'
                  ? theme.colors.traitNoText
                  : theme.colors.textMuted
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginVertical: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 4,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    labelContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    traitName: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    dealbreaker: {
      color: theme.colors.warning,
      fontSize: theme.typography.fontSize.base,
    },
    buttonsContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    stateButton: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    stateButtonActiveUnknown: {
      backgroundColor: theme.colors.traitUnknown,
      borderColor: theme.colors.traitUnknown,
    },
    stateButtonActiveYes: {
      backgroundColor: theme.colors.traitYes,
      borderColor: theme.colors.traitYes,
    },
    stateButtonActiveNo: {
      backgroundColor: theme.colors.traitNo,
      borderColor: theme.colors.traitNo,
    },
    stateButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    stateButtonTextActive: {
      color: theme.colors.traitUnknownText,
    },
  });
