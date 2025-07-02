import React, { useState } from 'react';
import { Wallet } from '@apstat-chain/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OnboardingProps {
  onWalletInitialized: (mnemonic: string) => void;
}

export const Onboarding = ({ onWalletInitialized }: OnboardingProps) => {
  const [mnemonic, setMnemonic] = useState('');
  const [restoredMnemonic, setRestoredMnemonic] = useState('');

  const handleGenerateWallet = () => {
    // Call our new static method to get a REAL mnemonic
    const newMnemonic = Wallet.generateMnemonic();
    setMnemonic(newMnemonic);
    // We don't call onWalletInitialized yet; user must confirm they saved it.
  };

  const handleRestoreWallet = () => {
    if (restoredMnemonic.trim().split(' ').length === 12) {
      onWalletInitialized(restoredMnemonic.trim());
    } else {
      alert('Please enter a valid 12-word mnemonic phrase.');
    }
  };

  if (mnemonic) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Save Your Mnemonic Phrase!</CardTitle>
          <CardDescription>This is your key. Write it down and store it securely. You will need it to recover your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-100 rounded-md text-center font-mono text-lg mb-4">
            {mnemonic}
          </div>
          <Button className="w-full" onClick={() => onWalletInitialized(mnemonic)}>
            I Have Saved My Phrase, Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Wallet</CardTitle>
          <CardDescription>Generate a new, unique 12-word phrase to secure your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGenerateWallet}>Generate New Wallet</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Restore Existing Wallet</CardTitle>
          <CardDescription>Enter your 12-word mnemonic phrase to restore your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Enter your 12-word phrase here..."
            value={restoredMnemonic}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRestoredMnemonic(e.target.value)}
          />
          <Button className="w-full" variant="secondary" onClick={handleRestoreWallet}>Restore Wallet</Button>
        </CardContent>
      </Card>
    </div>
  );
}; 