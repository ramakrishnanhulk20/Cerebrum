import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http, fallback } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Cerebrum - Health Data Platform',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'cf5d11022a642e528f427d4210e992db',
  chains: [sepolia],
  transports: {
    [sepolia.id]: fallback([
      // Primary Alchemy RPC
      http('https://eth-sepolia.g.alchemy.com/v2/OH-v4OaHwmmjCcqeiMEbE'),
      // Fallback to public Sepolia RPCs
      http('https://rpc.sepolia.org'),
      http('https://sepolia.gateway.tenderly.co'),
      http('https://ethereum-sepolia-rpc.publicnode.com'),
    ]),
  },
  ssr: false,
});
