import React from 'react';
import { Switch, SwitchProps } from 'react-native';
import { useTheme } from '@/hooks';
import { Container, Label } from './Toggle.styles';

interface ToggleProps extends Omit<SwitchProps, 'style'> {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <Container>
      <Label>{label}</Label>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.backgroundCard}
        ios_backgroundColor={colors.border}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: value, disabled }}
        {...props}
      />
    </Container>
  );
};
