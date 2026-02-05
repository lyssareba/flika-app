import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AttributesStep } from '../AttributesStep';

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

const mockAddAttribute = jest.fn();
const mockAddAttributeFromSuggestion = jest.fn();
const mockRemoveAttribute = jest.fn();
const mockRefreshSuggestions = jest.fn();

jest.mock('@/hooks', () => ({
  useAttributes: () => ({
    attributes: [
      { id: '1', name: 'Kind', category: 'desired', createdAt: new Date(), order: 1 },
      { id: '2', name: 'Honest', category: 'desired', createdAt: new Date(), order: 2 },
      { id: '3', name: 'Funny', category: 'desired', createdAt: new Date(), order: 3 },
    ],
    suggestions: ['Ambitious', 'Loyal', 'Patient'],
    hasMinimumAttributes: true,
    addAttribute: mockAddAttribute,
    addAttributeFromSuggestion: mockAddAttributeFromSuggestion,
    removeAttribute: mockRemoveAttribute,
    refreshSuggestions: mockRefreshSuggestions,
    toggleCategory: jest.fn(),
    reorderAttribute: jest.fn(),
    isLoading: false,
    refreshAttributes: jest.fn(),
  }),
}));

describe('AttributesStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title', () => {
    const { getByText } = render(
      <AttributesStep onNext={jest.fn()} onBack={jest.fn()} />
    );
    expect(getByText('What matters to you?')).toBeTruthy();
  });

  it('renders existing attributes', () => {
    const { getByText } = render(
      <AttributesStep onNext={jest.fn()} onBack={jest.fn()} />
    );
    expect(getByText('Kind')).toBeTruthy();
    expect(getByText('Honest')).toBeTruthy();
    expect(getByText('Funny')).toBeTruthy();
  });

  it('renders suggestion chips', () => {
    const { getByText } = render(
      <AttributesStep onNext={jest.fn()} onBack={jest.fn()} />
    );
    expect(getByText('Ambitious')).toBeTruthy();
    expect(getByText('Loyal')).toBeTruthy();
    expect(getByText('Patient')).toBeTruthy();
  });

  it('calls addAttributeFromSuggestion when suggestion chip is pressed', () => {
    const { getByText } = render(
      <AttributesStep onNext={jest.fn()} onBack={jest.fn()} />
    );
    fireEvent.press(getByText('Ambitious'));
    expect(mockAddAttributeFromSuggestion).toHaveBeenCalledWith('Ambitious', 'desired');
  });

  it('calls onNext when Next is pressed', () => {
    const onNext = jest.fn();
    const { getByText } = render(
      <AttributesStep onNext={onNext} onBack={jest.fn()} />
    );
    fireEvent.press(getByText('Next'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back arrow is pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = render(
      <AttributesStep onNext={jest.fn()} onBack={onBack} />
    );
    fireEvent.press(getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls refreshSuggestions when refresh is pressed', () => {
    const { getByLabelText } = render(
      <AttributesStep onNext={jest.fn()} onBack={jest.fn()} />
    );
    fireEvent.press(getByLabelText('Refresh'));
    expect(mockRefreshSuggestions).toHaveBeenCalledTimes(1);
  });
});
