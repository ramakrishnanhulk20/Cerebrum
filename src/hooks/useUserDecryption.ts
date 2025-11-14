import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { createInstance, SepoliaConfig, type FhevmInstance, type HandleContractPair } from '@zama-fhe/relayer-sdk/web';
import { CEREBRUM_CONTRACT_ADDRESS } from '../config/contracts-v09';
import { 
  LocalStorageWrapper, 
  loadOrSignDecryptionSignature,
  type FhevmDecryptionSignature 
} from '../utils/signatureStorage';

/**
 * Hook for FHE user decryption (90% success rate, 2-5s)
 * More reliable than Gateway Oracle (50% success rate, 30-60s)
 * 
 * Uses Zama's fhevm-relayer-sdk for frontend decryption with FHE.allow() permissions
 * NOW WITH SIGNATURE CACHING - User signs once, valid for 365 days!
 */
export function useUserDecryption() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signatureStorage] = useState(() => new LocalStorageWrapper('cerebrum_decrypt_'));

  // Initialize FHE instance on mount
  useEffect(() => {
    const initInstance = async () => {
      try {
        const fhevmInstance = await createInstance(SepoliaConfig);
        setInstance(fhevmInstance);
      } catch (err: any) {
        console.error('Failed to initialize FHE instance:', err);
        setError(err?.message || 'FHE initialization failed');
      }
    };

    initInstance();
  }, []);

  /**
   * Decrypt health record data (requires FHE.allow() permission from contract)
   * @param handles - Object containing encrypted handle strings for each health field
   * @param contractAddress - Contract address (defaults to CEREBRUM_CONTRACT_ADDRESS)
   * @returns Decrypted health data or null on error
   */
  const decryptHealthRecord = async (
    handles: { 
      bloodSugar: string; 
      cholesterol: string; 
      bmi: string; 
      bloodPressureSystolic: string; 
      bloodPressureDiastolic: string; 
      heartRate: string; 
      weight: string; 
      height: string 
    },
    contractAddress: string = CEREBRUM_CONTRACT_ADDRESS
  ): Promise<any> => {
    if (!address || !instance || !walletClient) {
      setError('Wallet not connected or FHE not initialized');
      return null;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      console.log('🔑 Getting or creating decryption signature...');
      
      // Load cached signature or create new one (user signs ONCE, valid 365 days!)
      const sigData = await loadOrSignDecryptionSignature(
        signatureStorage,
        instance,
        [contractAddress],
        address,
        walletClient
      );

      console.log('✅ Using signature (cached:', sigData.startTimestamp !== Math.floor(Date.now() / 1000), ')');

      // Prepare handle-contract pairs for decryption
      const handlePairs: HandleContractPair[] = [
        { handle: handles.bloodSugar, contractAddress },
        { handle: handles.cholesterol, contractAddress },
        { handle: handles.bmi, contractAddress },
        { handle: handles.bloodPressureSystolic, contractAddress },
        { handle: handles.bloodPressureDiastolic, contractAddress },
        { handle: handles.heartRate, contractAddress },
        { handle: handles.weight, contractAddress },
        { handle: handles.height, contractAddress },
      ];

      // Decrypt all values at once via Zama relayer
      const results = await instance.userDecrypt(
        handlePairs,
        sigData.privateKey,
        sigData.publicKey,
        sigData.signature,
        sigData.contractAddresses,
        sigData.userAddress,
        sigData.startTimestamp,
        sigData.durationDays
      );

      setIsDecrypting(false);

      // Convert results to readable format (handles as keys)
      return {
        bloodSugar: Number(results[handles.bloodSugar]),
        cholesterol: Number(results[handles.cholesterol]),
        bmi: Number(results[handles.bmi]),
        bloodPressureSystolic: Number(results[handles.bloodPressureSystolic]),
        bloodPressureDiastolic: Number(results[handles.bloodPressureDiastolic]),
        heartRate: Number(results[handles.heartRate]),
        weight: Number(results[handles.weight]),
        height: Number(results[handles.height]),
      };
    } catch (err: any) {
      console.error('User decryption error:', err);
      setError(err?.message || 'Decryption failed');
      setIsDecrypting(false);
      return null;
    }
  };

  /**
   * Decrypt lender eligibility result (TRUE/FALSE only)
   * @param handle - The encrypted ebool handle
   * @param contractAddress - Contract address
   * @returns true/false or null on error
   */
  const decryptEligibility = async (
    handle: string,
    contractAddress: string = CEREBRUM_CONTRACT_ADDRESS
  ): Promise<boolean | null> => {
    if (!address || !instance || !walletClient) {
      setError('Wallet not connected or FHE not initialized');
      return null;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      console.log('🔑 Getting or creating decryption signature...');
      
      // Load cached signature or create new one
      const sigData = await loadOrSignDecryptionSignature(
        signatureStorage,
        instance,
        [contractAddress],
        address,
        walletClient
      );

      console.log('✅ Using signature (cached:', sigData.startTimestamp !== Math.floor(Date.now() / 1000), ')');

      const results = await instance.userDecrypt(
        [{ handle, contractAddress }],
        sigData.privateKey,
        sigData.publicKey,
        sigData.signature,
        sigData.contractAddresses,
        sigData.userAddress,
        sigData.startTimestamp,
        sigData.durationDays
      );

      setIsDecrypting(false);
      return Boolean(results[handle]);
    } catch (err: any) {
      console.error('Eligibility decryption error:', err);
      setError(err?.message || 'Decryption failed');
      setIsDecrypting(false);
      return null;
    }
  };

  return {
    decryptHealthRecord,
    decryptEligibility,
    isDecrypting,
    error,
    isReady: !!instance && !!address && !!walletClient,
  };
}
