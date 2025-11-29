// components/WalletConnectButton.tsx
'use client'; // This component MUST be a client component because it uses hooks

import { ConnectButton } from '@rainbow-me/rainbowkit';
import * as React from 'react';

export function WalletConnectButton() {
  return (
    <div style={{ padding: '16px' }}>
      <ConnectButton 
        label="Connect Wallet" 
        chainStatus="icon" // Shows the Sepolia icon
        accountStatus="avatar" // Shows the user's address/ENS
      />
    </div>
  );
}