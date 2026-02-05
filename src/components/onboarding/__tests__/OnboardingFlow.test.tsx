import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingFlow } from '../OnboardingFlow';

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

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123' },
    userProfile: { id: 'test-user-123', onboardingCompleted: false },
    isLoading: false,
    isAuthenticated: true,
    refreshProfile: jest.fn(),
  }),
}));

jest.mock('@/services/firebase/firestore', () => ({
  completeOnboarding: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/hooks', () => ({
  useAttributes: () => ({
    attributes: [
      { id: '1', name: 'Kind', category: 'desired', createdAt: new Date(), order: 1 },
      { id: '2', name: 'Honest', category: 'desired', createdAt: new Date(), order: 2 },
      { id: '3', name: 'Funny', category: 'desired', createdAt: new Date(), order: 3 },
    ],
    suggestions: ['Ambitious', 'Loyal'],
    hasMinimumAttributes: true,
    addAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    toggleCategory: jest.fn(),
    refreshSuggestions: jest.fn(),
    reorderAttribute: jest.fn(),
    isLoading: false,
    refreshAttributes: jest.fn(),
  }),
  useAppLock: () => ({
    setupPin: jest.fn(),
    enableAppLock: jest.fn(),
    enableBiometric: jest.fn(),
    isBiometricAvailable: false,
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

describe('OnboardingFlow', () => {
  it('starts on the Welcome step', () => {
    const { getByText } = render(
      <OnboardingFlow onComplete={jest.fn()} />
    );
    expect(getByText('Welcome')).toBeTruthy();
    expect(getByText("Let's get started")).toBeTruthy();
  });

  it('navigates to Attributes step when "Let\'s get started" is pressed', () => {
    const { getByText } = render(
      <OnboardingFlow onComplete={jest.fn()} />
    );
    fireEvent.press(getByText("Let's get started"));
    expect(getByText('What matters to you?')).toBeTruthy();
  });

  it('navigates from Attributes to Dealbreakers', () => {
    const { getByText } = render(
      <OnboardingFlow onComplete={jest.fn()} />
    );
    fireEvent.press(getByText("Let's get started"));
    fireEvent.press(getByText('Next'));
    expect(getByText('Which are dealbreakers?')).toBeTruthy();
  });

  it('navigates from Dealbreakers to Security', () => {
    const { getByText } = render(
      <OnboardingFlow onComplete={jest.fn()} />
    );
    fireEvent.press(getByText("Let's get started"));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Next'));
    expect(getByText('Protect Your Data')).toBeTruthy();
  });

  it('can navigate back from Attributes to Welcome', () => {
    const { getByText, getByLabelText } = render(
      <OnboardingFlow onComplete={jest.fn()} />
    );
    fireEvent.press(getByText("Let's get started"));
    expect(getByText('What matters to you?')).toBeTruthy();
    fireEvent.press(getByLabelText('Back'));
    expect(getByText('Welcome')).toBeTruthy();
  });

  it('can navigate back from Dealbreakers to Attributes', () => {
    const { getByText, getByLabelText } = render(
      <OnboardingFlow onComplete={jest.fn()} />
    );
    fireEvent.press(getByText("Let's get started"));
    fireEvent.press(getByText('Next'));
    expect(getByText('Which are dealbreakers?')).toBeTruthy();
    fireEvent.press(getByLabelText('Back'));
    expect(getByText('What matters to you?')).toBeTruthy();
  });

  it('can navigate back from Security to Dealbreakers', () => {
    const { getByText, getByLabelText } = render(
      <OnboardingFlow onComplete={jest.fn()} />
    );
    fireEvent.press(getByText("Let's get started"));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Next'));
    expect(getByText('Protect Your Data')).toBeTruthy();
    fireEvent.press(getByLabelText('Back'));
    expect(getByText('Which are dealbreakers?')).toBeTruthy();
  });

  it('calls completeOnboarding and onComplete on Finish', () => {
    const { completeOnboarding } = require('@/services/firebase/firestore');
    const onComplete = jest.fn(() => Promise.resolve());

    const { getByText } = render(
      <OnboardingFlow onComplete={onComplete} />
    );

    // Navigate through all steps
    fireEvent.press(getByText("Let's get started"));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Finish'));

    expect(completeOnboarding).toHaveBeenCalledWith('test-user-123');
  });
});
