/**
 * Hook to automatically initialize FHEVM when wallet connects
 * Initializes ONLY ONCE per wallet connection
 */

import { useEffect, useState, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { initializeFhevm } from '../utils/fhevm-v09';

export function useInitFhevm() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const initAttemptedRef = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      // Only initialize once when wallet connects
      if (!isConnected || !address || !walletClient) {
        setIsInitialized(false);
        initAttemptedRef.current = false;
        return;
      }

      // Prevent duplicate initialization
      if (initAttemptedRef.current) {
        return;
      }

      initAttemptedRef.current = true;

      try {
        console.log('✅ Wallet connected:', address);
        console.log('🔄 Initializing FHEVM v0.9.1...');
        
        // Convert WalletClient to BrowserProvider for ethers compatibility
        const { account, chain, transport } = walletClient;
        const network = {
          chainId: chain.id,
          name: chain.name,
          ensAddress: chain.contracts?.ensRegistry?.address,
        };
        const provider = new BrowserProvider(transport, network);
        
        await initializeFhevm(provider);
        
        console.log('✅ FHEVM v0.9.1 initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Failed to initialize FHEVM:', error);
        setIsInitialized(false);
        initAttemptedRef.current = false; // Allow retry on error
      }
    };

    initialize();
  }, [isConnected, address, walletClient]);

  return { isInitialized, address, isConnected };
}
