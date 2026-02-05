import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SecurityStep } from '../SecurityStep';

jest.mock('@/theme', () => {
  const { mockThemeContext } = require('@/test/mockTheme');
  return { useThemeContext: () => mockThemeContext };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

const mockSetupPin = jest.fn();
const mockEnableAppLock = jest.fn();
const mockEnableBiometric = jest.fn();

jest.mock('@/hooks', () => ({
  useAppLock: () => ({
    setupPin: mockSetupPin,
    enableAppLock: mockEnableAppLock,
    enableBiometric: mockEnableBiometric,
    isBiometricAvailable: true,
    hasPinSet: false,
    isLocked: false,
    isAppLockEnabled: false,
    isBiometricEnabled: false,
    lock: jest.fn(),
    unlockWithPin: jest.fn(),
    unlockWithBiometric: jest.fn(),
    removePin: jest.fn(),
    updateTimeout: jest.fn(),
    getLockTimeout: jest.fn(),
  }),
}));

jest.mock('@/components/lock', () => ({
  PinKeypad: ({ onDigit, onDelete }: any) => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return (
      <View>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
          <TouchableOpacity key={d} onPress={() => onDigit(d)} accessibilityLabel={d}>
            <Text>{d}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={onDelete} accessibilityLabel="Delete">
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

describe('SecurityStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders security title and description', () => {
    const { getByText } = render(
      <SecurityStep onComplete={jest.fn()} onBack={jest.fn()} />
    );
    expect(getByText('Protect Your Data')).toBeTruthy();
    expect(
      getByText('Add an extra layer of privacy to keep your dating notes safe.')
    ).toBeTruthy();
  });

  it('renders Set Up PIN option', () => {
    const { getByText } = render(
      <SecurityStep onComplete={jest.fn()} onBack={jest.fn()} />
    );
    expect(getByText('Set Up PIN')).toBeTruthy();
  });

  it('renders Finish button', () => {
    const { getByText } = render(
      <SecurityStep onComplete={jest.fn()} onBack={jest.fn()} />
    );
    expect(getByText('Finish')).toBeTruthy();
  });

  it('renders Skip for now button', () => {
    const { getByText } = render(
      <SecurityStep onComplete={jest.fn()} onBack={jest.fn()} />
    );
    expect(getByText('Skip for now')).toBeTruthy();
  });

  it('calls onComplete when Finish is pressed', () => {
    const onComplete = jest.fn(() => Promise.resolve());
    const { getByText } = render(
      <SecurityStep onComplete={onComplete} onBack={jest.fn()} />
    );
    fireEvent.press(getByText('Finish'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete when Skip for now is pressed', () => {
    const onComplete = jest.fn(() => Promise.resolve());
    const { getByText } = render(
      <SecurityStep onComplete={onComplete} onBack={jest.fn()} />
    );
    fireEvent.press(getByText('Skip for now'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows PIN entry when Set Up PIN is pressed', () => {
    const { getByText } = render(
      <SecurityStep onComplete={jest.fn()} onBack={jest.fn()} />
    );
    fireEvent.press(getByText('Set Up PIN'));
    expect(getByText('Enter a 4-digit PIN')).toBeTruthy();
  });

  it('calls onBack when back arrow is pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = render(
      <SecurityStep onComplete={jest.fn()} onBack={onBack} />
    );
    fireEvent.press(getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
