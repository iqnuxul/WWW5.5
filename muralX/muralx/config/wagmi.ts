// config/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// IMPORTANT: Replace this with your actual WalletConnect Project ID.
// You can get a free ID by signing up at https://cloud.walletconnect.com
export const projectId = '9ab9c52f5dbb280809166bbaf93c2a01'; 

// 1. Define the chains your app supports (we only need Sepolia for now)
const chains = [sepolia] as const;

// 2. Create the core Wagmi configuration
export const config = getDefaultConfig({
  appName: 'MuralX App',
  projectId,
  chains: [sepolia],
  ssr: true, // Crucial for Next.js Server Side Rendering compatibility
  transports: {
    [sepolia.id]: http(),
  },
});