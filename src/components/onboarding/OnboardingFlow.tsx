import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { completeOnboarding } from '@/services/firebase/firestore';
import { claimEarlyAdopterSlot } from '@/services/firebase/earlyAdopterService';
import { purchasesService } from '@/services/purchases';
import { FEATURE_FLAGS } from '@/config';
import { WelcomeStep } from './WelcomeStep';
import { AttributesStep } from './AttributesStep';
import { DealbreakersStep } from './DealbreakersStep';
import { SecurityStep } from './SecurityStep';
import { EarlyAdopterStep } from './EarlyAdopterStep';

type OnboardingStep = 'welcome' | 'attributes' | 'dealbreakers' | 'security' | 'earlyAdopter';

interface OnboardingFlowProps {
  onComplete: () => Promise<void>;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [earlyAdopterSlot, setEarlyAdopterSlot] = useState<number | null>(null);
  const { user } = useAuth();

  const handleComplete = async () => {
    if (!user) {
      throw new Error('Cannot complete onboarding: user is not authenticated');
    }
    await completeOnboarding(user.uid);

    if (FEATURE_FLAGS.earlyAdopterEnabled) {
      try {
        const result = await claimEarlyAdopterSlot(user.uid);
        if (result.success && result.slotNumber != null) {
          setEarlyAdopterSlot(result.slotNumber);
          purchasesService.setEarlyAdopterAttribute(result.slotNumber).catch(() => {});
          setStep('earlyAdopter');
          return;
        }
      } catch (error) {
        console.error('Early adopter claim failed:', error);
        // Claim failed — fall through to normal completion
      }
    }

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
    case 'earlyAdopter':
      return (
        <EarlyAdopterStep
          slotNumber={earlyAdopterSlot!}
          onNext={onComplete}
        />
      );
  }
};
