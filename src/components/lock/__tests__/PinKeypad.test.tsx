import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PinKeypad } from '../PinKeypad';

// Mock theme context
jest.mock('@/theme', () => {
  const mockTheme = {
    mode: 'light',
    colors: {
      primary: '#FF6B6B',
      primaryLight: '#FFE0E0',
      primaryDark: '#CC5555',
      secondary: '#4ECDC4',
      accent: '#FFD93D',
      background: '#FFFFFF',
      backgroundCard: '#F8F9FA',
      backgroundElevated: '#FFFFFF',
      textPrimary: '#1A1A2E',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#E0E0E0',
      peach: '#FFDAB9',
      traitUnknown: '#F3F4F6',
      traitUnknownText: '#6B7280',
      traitYes: '#D1FAE5',
      traitYesText: '#065F46',
      traitNo: '#FEE2E2',
      traitNoText: '#991B1B',
    },
    typography: {
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
      },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      },
    },
  };

  return {
    useThemeContext: () => ({
      theme: mockTheme,
      mode: 'system',
      setMode: jest.fn(),
      effectiveMode: 'light',
    }),
  };
});

describe('PinKeypad', () => {
  const defaultProps = {
    onDigit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all digit buttons (0-9)', () => {
    const { getByText } = render(<PinKeypad {...defaultProps} />);
    for (let i = 0; i <= 9; i++) {
      expect(getByText(String(i))).toBeTruthy();
    }
  });

  it('renders delete button', () => {
    const { getByLabelText } = render(<PinKeypad {...defaultProps} />);
    expect(getByLabelText('Delete')).toBeTruthy();
  });

  it('calls onDigit when a digit is pressed', () => {
    const onDigit = jest.fn();
    const { getByText } = render(
      <PinKeypad {...defaultProps} onDigit={onDigit} />
    );
    fireEvent.press(getByText('5'));
    expect(onDigit).toHaveBeenCalledWith('5');
  });

  it('calls onDelete when delete is pressed', () => {
    const onDelete = jest.fn();
    const { getByLabelText } = render(
      <PinKeypad {...defaultProps} onDelete={onDelete} />
    );
    fireEvent.press(getByLabelText('Delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders biometric button when onBiometric is provided', () => {
    const onBiometric = jest.fn();
    const { getByLabelText } = render(
      <PinKeypad {...defaultProps} onBiometric={onBiometric} />
    );
    expect(getByLabelText('Unlock with biometrics')).toBeTruthy();
  });

  it('does not render biometric button when onBiometric is not provided', () => {
    const { queryByLabelText } = render(<PinKeypad {...defaultProps} />);
    expect(queryByLabelText('Unlock with biometrics')).toBeNull();
  });

  it('calls onBiometric when biometric button is pressed', () => {
    const onBiometric = jest.fn();
    const { getByLabelText } = render(
      <PinKeypad {...defaultProps} onBiometric={onBiometric} />
    );
    fireEvent.press(getByLabelText('Unlock with biometrics'));
    expect(onBiometric).toHaveBeenCalledTimes(1);
  });
});
