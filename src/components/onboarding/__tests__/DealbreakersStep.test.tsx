import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DealbreakersStep } from '../DealbreakersStep';

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

const mockToggleCategory = jest.fn();

jest.mock('@/hooks', () => ({
  useAttributes: () => ({
    attributes: [
      { id: '1', name: 'Kind', category: 'desired', createdAt: new Date(), order: 1 },
      { id: '2', name: 'Honest', category: 'dealbreaker', createdAt: new Date(), order: 2 },
      { id: '3', name: 'Funny', category: 'desired', createdAt: new Date(), order: 3 },
    ],
    toggleCategory: mockToggleCategory,
    suggestions: [],
    hasMinimumAttributes: true,
    addAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    refreshSuggestions: jest.fn(),
    reorderAttribute: jest.fn(),
    isLoading: false,
    refreshAttributes: jest.fn(),
  }),
}));

describe('DealbreakersStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title', () => {
    const { getByText } = render(
      <DealbreakersStep onNext={jest.fn()} onBack={jest.fn()} />
    );
    expect(getByText('Which are dealbreakers?')).toBeTruthy();
  });

  it('renders all attributes', () => {
    const { getByText } = render(
      <DealbreakersStep onNext={jest.fn()} onBack={jest.fn()} />
    );
    expect(getByText('Kind')).toBeTruthy();
    expect(getByText('Honest')).toBeTruthy();
    expect(getByText('Funny')).toBeTruthy();
  });

  it('calls toggleCategory when an attribute card is pressed', () => {
    const { getByText } = render(
      <DealbreakersStep onNext={jest.fn()} onBack={jest.fn()} />
    );
    fireEvent.press(getByText('Kind'));
    expect(mockToggleCategory).toHaveBeenCalledWith('1');
  });

  it('calls onNext when Next is pressed', () => {
    const onNext = jest.fn();
    const { getByText } = render(
      <DealbreakersStep onNext={onNext} onBack={jest.fn()} />
    );
    fireEvent.press(getByText('Next'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back arrow is pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = render(
      <DealbreakersStep onNext={jest.fn()} onBack={onBack} />
    );
    fireEvent.press(getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
