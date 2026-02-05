import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { completeOnboarding } from '@/services/firebase/firestore';
import { WelcomeStep } from './WelcomeStep';
import { AttributesStep } from './AttributesStep';
import { DealbreakersStep } from './DealbreakersStep';
import { SecurityStep } from './SecurityStep';

type OnboardingStep = 'welcome' | 'attributes' | 'dealbreakers' | 'security';

interface OnboardingFlowProps {
  onComplete: () => Promise<void>;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const { user } = useAuth();

  const handleComplete = async () => {
    if (!user) {
      throw new Error('Cannot complete onboarding: user is not authenticated');
    }
    await completeOnboarding(user.uid);
    await onComplete();
  };

  switch (step) {
    case 'welcome':
      return <WelcomeStep onNext={() => setStep('attributes')} />;
    case 'attributes':
      return (
        <AttributesStep
          onNext={() => setStep('dealbreakers')}
          onBack={() => setStep('welcome')}
        />
      );
    case 'dealbreakers':
      return (
        <DealbreakersStep
          onNext={() => setStep('security')}
          onBack={() => setStep('attributes')}
        />
      );
    case 'security':
      return (
        <SecurityStep
          onComplete={handleComplete}
          onBack={() => setStep('dealbreakers')}
        />
      );
  }
};
