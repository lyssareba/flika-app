import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WelcomeStep } from '../WelcomeStep';

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

describe('WelcomeStep', () => {
  it('renders welcome text', () => {
    const { getByText } = render(<WelcomeStep onNext={jest.fn()} />);
    expect(getByText('Welcome')).toBeTruthy();
  });

  it('renders tagline', () => {
    const { getByText } = render(<WelcomeStep onNext={jest.fn()} />);
    expect(
      getByText("Your dating companion that helps you find what you're really looking for.")
    ).toBeTruthy();
  });

  it('renders "Let\'s get started" button', () => {
    const { getByText } = render(<WelcomeStep onNext={jest.fn()} />);
    expect(getByText("Let's get started")).toBeTruthy();
  });

  it('calls onNext when button is pressed', () => {
    const onNext = jest.fn();
    const { getByText } = render(<WelcomeStep onNext={onNext} />);
    fireEvent.press(getByText("Let's get started"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
