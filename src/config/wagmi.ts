import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY || 'demo';

export const config = getDefaultConfig({
  appName: 'Cerebrum - Health Data Platform',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`),
  },
  ssr: false,
});
