/**
 * Hook to automatically initialize FHEVM when wallet connects
 * Initializes ONLY ONCE per wallet connection
 */

import { useEffect, useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { initializeFhevm as initFhevm } from '../utils/fhevm-v09';

export function useInitFhevm() {
  const { address, isConnected } = useAccount();
  const [isInitialized, setIsInitialized] = useState(false);
  const initAttemptedRef = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      // Only initialize once when wallet connects
      if (!isConnected || !address) {
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
        console.log('🔄 Initializing FHEVM v0.9...');
        
        await initFhevm();
        
        console.log('✅ FHEVM initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Failed to initialize FHEVM:', error);
        setIsInitialized(false);
        initAttemptedRef.current = false; // Allow retry on error
      }
    };

    initialize();
  }, [isConnected, address]);

  return { isInitialized, address, isConnected };
}
