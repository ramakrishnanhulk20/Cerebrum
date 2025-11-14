/**
 * React hooks for FHEVM v0.9 integration
 * Provides easy-to-use hooks for Patient, Researcher, and Lender operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import toast from 'react-hot-toast';
import {
  initializeFhevm,
  createEncryptedHealthData,
  createEncryptedThreshold,
  decryptUint64,
  decryptBool,
  batchDecryptUint64,
  formatHealthScore,
  formatRiskScore,
  wagmiToEthersProvider,
  type EncryptedHealthData,
  type EncryptedThreshold,
} from '../utils/fhevm-v09';

/**
 * Initialize FHEVM v0.9 instance
 * Call this hook once in your app (in App.tsx or main layout)
 */
export function useFhevmInit() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isConnected || !walletClient || isInitialized || isInitializing) return;

    const init = async () => {
      console.log('🚀 [useFhevmInit] Starting FHEVM initialization...');
      console.log('👤 Connected address:', address);
      
      setIsInitializing(true);
      setError(null);

      try {
        const provider = wagmiToEthersProvider(walletClient);
        console.log('✅ [useFhevmInit] Ethers provider created from Wagmi');
        
        await initializeFhevm(provider);
        
        setIsInitialized(true);
        console.log('✅ [useFhevmInit] FHEVM v0.9 initialized successfully');
        toast.success('✅ FHEVM initialized!');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
        setError(error);
        console.error('❌ [useFhevmInit] FHEVM initialization failed:', error);
        toast.error('Failed to initialize encryption system');
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [isConnected, walletClient, isInitialized, isInitializing]);

  return { isInitialized, isInitializing, error };
}

/**
 * Hook for Patient operations
 * Handles health data encryption and credit score decryption
 */
export function usePatientFhevm(contractAddress: string) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  /**
   * Encrypt health data for sharing (v0.9 pattern with createEncryptedInput)
   * Returns handles and inputProof for contract call
   */
  const encryptHealthData = useCallback(
    async (healthData: {
      bloodSugar: number;
      cholesterol: number;
      bmi: number;
      bloodPressureSystolic: number;
      bloodPressureDiastolic: number;
      heartRate: number;
      weight: number;
      height: number;
    }): Promise<EncryptedHealthData> => {
      console.log('🏥 [usePatientFhevm] Starting health data encryption...');
      console.log('📋 [usePatientFhevm] Data to encrypt:', healthData);

      if (!walletClient || !address) {
        console.error('❌ [usePatientFhevm] Wallet not connected');
        throw new Error('Wallet not connected');
      }

      const toastId = toast.loading('Encrypting health data...');

      try {
        const provider = wagmiToEthersProvider(walletClient);
        console.log('✅ [usePatientFhevm] Ethers provider created');
        console.log('📍 [usePatientFhevm] Contract address:', contractAddress);
        console.log('👤 [usePatientFhevm] User address:', address);

        const encrypted = await createEncryptedHealthData(
          provider,
          contractAddress,
          address,
          healthData
        );

        console.log('✅ [usePatientFhevm] Encryption completed');
        console.log('📦 [usePatientFhevm] Result:', {
          handlesCount: encrypted.handles.length,
          hasInputProof: !!encrypted.inputProof
        });

        toast.success('✅ Health data encrypted!', { id: toastId });
        return encrypted;
      } catch (error) {
        console.error('❌ [usePatientFhevm] Encryption failed:', error);
        toast.error('❌ Failed to encrypt data', { id: toastId });
        throw error;
      }
    },
    [walletClient, address, contractAddress]
  );

  /**
   * Decrypt credit score using User Decryption (EIP-712 signature)
   * Instant decryption in 0-2 seconds!
   */
  const decryptHealthScore = useCallback(
    async (encryptedScore: string): Promise<number> => {
      console.log('🏥 [usePatientFhevm] Starting credit score decryption...');
      console.log('🔑 [usePatientFhevm] Encrypted score handle:', encryptedScore);

      if (!walletClient || !address) {
        console.error('❌ [usePatientFhevm] Wallet not connected');
        throw new Error('Wallet not connected');
      }

      const toastId = toast.loading('Please sign to decrypt your credit score...');

      try {
        const provider = wagmiToEthersProvider(walletClient);
        const signer = await provider.getSigner();
        console.log('✅ [usePatientFhevm] Signer obtained');
        
        const decrypted = await decryptUint64(
          provider,
          contractAddress,
          encryptedScore,
          signer
        );

        const score = formatHealthScore(decrypted);
        console.log('✅ [usePatientFhevm] Decryption completed');
        console.log('🎯 [usePatientFhevm] Credit score:', score);

        toast.success(`✅ Credit Score: ${score}`, { id: toastId });
        return score;
      } catch (error: any) {
        console.error('❌ [usePatientFhevm] Decryption failed:', error);
        if (error.code === 4001) {
          console.log('🚫 [usePatientFhevm] User rejected signature');
          toast.error('❌ Signature rejected', { id: toastId });
        } else {
          toast.error('❌ Decryption failed', { id: toastId });
        }
        throw error;
      }
    },
    [walletClient, address, contractAddress]
  );

  return {
    encryptHealthData,
    decryptHealthScore,
  };
}

/**
 * Hook for Researcher operations
 * Handles health record decryption and risk score decryption
 */
export function useResearcherFhevm(contractAddress: string) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  /**
   * Decrypt full health record using User Decryption (batch decrypt 8 values)
   * Returns all health metrics in plaintext
   */
  const decryptHealthRecord = useCallback(
    async (encryptedRecord: {
      bloodSugar: string;
      cholesterol: string;
      bmi: string;
      bloodPressureSystolic: string;
      bloodPressureDiastolic: string;
      heartRate: string;
      weight: string;
      height: string;
    }): Promise<{
      bloodSugar: number;
      cholesterol: number;
      bmi: number;
      bloodPressureSystolic: number;
      bloodPressureDiastolic: number;
      heartRate: number;
      weight: number;
      height: number;
    }> => {
      console.log('🔬 [useResearcherFhevm] Starting health record decryption...');
      console.log('📊 [useResearcherFhevm] Number of fields to decrypt: 8');

      if (!walletClient || !address) {
        console.error('❌ [useResearcherFhevm] Wallet not connected');
        throw new Error('Wallet not connected');
      }

      const toastId = toast.loading('Please sign to decrypt health record...');

      try {
        const provider = wagmiToEthersProvider(walletClient);
        const signer = await provider.getSigner();
        console.log('✅ [useResearcherFhevm] Signer obtained');

        // Batch decrypt all 8 values at once for speed
        const ciphertexts = [
          encryptedRecord.bloodSugar,
          encryptedRecord.cholesterol,
          encryptedRecord.bmi,
          encryptedRecord.bloodPressureSystolic,
          encryptedRecord.bloodPressureDiastolic,
          encryptedRecord.heartRate,
          encryptedRecord.weight,
          encryptedRecord.height,
        ];
        console.log('📋 [useResearcherFhevm] Ciphertexts prepared:', ciphertexts);

        const decrypted = await batchDecryptUint64(
          provider,
          contractAddress,
          ciphertexts,
          signer
        );

        const record = {
          bloodSugar: Number(decrypted[0]),
          cholesterol: Number(decrypted[1]),
          bmi: Number(decrypted[2]),
          bloodPressureSystolic: Number(decrypted[3]),
          bloodPressureDiastolic: Number(decrypted[4]),
          heartRate: Number(decrypted[5]),
          weight: Number(decrypted[6]),
          height: Number(decrypted[7]),
        };

        console.log('✅ [useResearcherFhevm] Health record decrypted successfully');
        console.log('📊 [useResearcherFhevm] Decrypted record:', record);
        toast.success('✅ Health record decrypted!', { id: toastId });

        return record;
      } catch (error: any) {
        console.error('❌ [useResearcherFhevm] Decryption failed:', error);
        if (error.code === 4001) {
          console.log('🚫 [useResearcherFhevm] User rejected signature');
          toast.error('❌ Signature rejected', { id: toastId });
        } else {
          toast.error('❌ Decryption failed', { id: toastId });
        }
        throw error;
      }
    },
    [walletClient, address, contractAddress]
  );

  /**
   * Decrypt risk scores using User Decryption (batch decrypt 3 values)
   * Returns diabetes, heart disease, and stroke risk percentages
   */
  const decryptRiskScores = useCallback(
    async (encryptedRisks: {
      diabetesRisk: string;
      heartDiseaseRisk: string;
      strokeRisk: string;
    }): Promise<{
      diabetesRisk: number;
      heartDiseaseRisk: number;
      strokeRisk: number;
    }> => {
      if (!walletClient || !address) {
        throw new Error('Wallet not connected');
      }

      const toastId = toast.loading('Please sign to decrypt risk scores...');

      try {
        const provider = wagmiToEthersProvider(walletClient);
        const signer = await provider.getSigner();

        const ciphertexts = [
          encryptedRisks.diabetesRisk,
          encryptedRisks.heartDiseaseRisk,
          encryptedRisks.strokeRisk,
        ];

        const decrypted = await batchDecryptUint64(
          provider,
          contractAddress,
          ciphertexts,
          signer
        );

        toast.success('✅ Risk scores decrypted!', { id: toastId });

        return {
          diabetesRisk: formatRiskScore(decrypted[0]),
          heartDiseaseRisk: formatRiskScore(decrypted[1]),
          strokeRisk: formatRiskScore(decrypted[2]),
        };
      } catch (error: any) {
        const message: string | undefined = error?.message || (typeof error === 'string' ? error : undefined);

        if (error.code === 4001) {
          toast.error('❌ Signature rejected', { id: toastId });
        } else if (message && message.includes('is not authorized to user decrypt handle')) {
          toast.error('🔒 Your access for this record has expired. Please purchase access again.', { id: toastId });
        } else {
          toast.error('❌ Decryption failed', { id: toastId });
        }
        throw error;
      }
    },
    [walletClient, address, contractAddress]
  );

  return {
    decryptHealthRecord,
    decryptRiskScores,
  };
}

/**
 * Hook for Lender operations
 * Handles encrypted threshold creation and eligibility result decryption
 */
export function useLenderFhevm(contractAddress: string) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  /**
   * Create encrypted threshold for privacy-preserving eligibility check
   * Both threshold and patient score remain encrypted!
   */
  const encryptThreshold = useCallback(
    async (minScore: number): Promise<EncryptedThreshold> => {
      console.log('💰 [useLenderFhevm] Starting threshold encryption...');
      console.log('📊 [useLenderFhevm] Minimum score:', minScore);

      if (!walletClient || !address) {
        console.error('❌ [useLenderFhevm] Wallet not connected');
        throw new Error('Wallet not connected');
      }

      const toastId = toast.loading('Encrypting threshold...');

      try {
        const provider = wagmiToEthersProvider(walletClient);
        console.log('✅ [useLenderFhevm] Ethers provider created');

        const encrypted = await createEncryptedThreshold(
          provider,
          contractAddress,
          address,
          minScore
        );

        console.log('✅ [useLenderFhevm] Threshold encrypted successfully');
        toast.success('✅ Threshold encrypted!', { id: toastId });
        return encrypted;
      } catch (error) {
        console.error('❌ [useLenderFhevm] Encryption failed:', error);
        toast.error('❌ Failed to encrypt threshold', { id: toastId });
        throw error;
      }
    },
    [walletClient, address, contractAddress]
  );

  /**
   * Decrypt eligibility result (TRUE/FALSE only, never the actual score!)
   * Uses User Decryption for instant result
   */
  const decryptEligibilityResult = useCallback(
    async (encryptedResult: string): Promise<boolean> => {
      console.log('💰 [useLenderFhevm] Starting eligibility result decryption...');
      console.log('🔑 [useLenderFhevm] Encrypted result handle:', encryptedResult);

      if (!walletClient || !address) {
        console.error('❌ [useLenderFhevm] Wallet not connected');
        throw new Error('Wallet not connected');
      }

      const toastId = toast.loading('Please sign to decrypt eligibility result...');

      try {
        const provider = wagmiToEthersProvider(walletClient);
        const signer = await provider.getSigner();
        console.log('✅ [useLenderFhevm] Signer obtained');
        
        const result = await decryptBool(
          provider,
          contractAddress,
          encryptedResult,
          signer
        );

        console.log('✅ [useLenderFhevm] Eligibility result decrypted');
        console.log('🎯 [useLenderFhevm] Is eligible:', result);

        const message = result
          ? '✅ Patient is eligible!'
          : '❌ Patient does not meet requirements';
        toast.success(message, { id: toastId });

        return result;
      } catch (error: any) {
        console.error('❌ [useLenderFhevm] Decryption failed:', error);
        if (error.code === 4001) {
          console.log('🚫 [useLenderFhevm] User rejected signature');
          toast.error('❌ Signature rejected', { id: toastId });
        } else {
          toast.error('❌ Decryption failed', { id: toastId });
        }
        throw error;
      }
    },
    [walletClient, address, contractAddress]
  );

  return {
    encryptThreshold,
    decryptEligibilityResult,
  };
}

/**
 * Generic hook for decrypting any euint64 value
 * Useful for custom decryption scenarios
 */
export function useDecryptUint64(contractAddress: string) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const decrypt = useCallback(
    async (ciphertext: string, toastMessage?: string): Promise<bigint> => {
      if (!walletClient || !address) {
        throw new Error('Wallet not connected');
      }

      const toastId = toast.loading(toastMessage || 'Decrypting value...');

      try {
        const provider = wagmiToEthersProvider(walletClient);
        const signer = await provider.getSigner();
        
        const decrypted = await decryptUint64(
          provider,
          contractAddress,
          ciphertext,
          signer
        );

        toast.success('✅ Decrypted successfully!', { id: toastId });
        return decrypted;
      } catch (error: any) {
        if (error.code === 4001) {
          toast.error('❌ Signature rejected', { id: toastId });
        } else {
          toast.error('❌ Decryption failed', { id: toastId });
        }
        throw error;
      }
    },
    [walletClient, address, contractAddress]
  );

  return { decrypt };
}

/**
 * Generic hook for decrypting any ebool value
 * Useful for custom boolean decryption scenarios
 */
export function useDecryptBool(contractAddress: string) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const decrypt = useCallback(
    async (ciphertext: string, toastMessage?: string): Promise<boolean> => {
      if (!walletClient || !address) {
        throw new Error('Wallet not connected');
      }

      const toastId = toast.loading(toastMessage || 'Decrypting value...');

      try {
        const provider = wagmiToEthersProvider(walletClient);
        const signer = await provider.getSigner();
        
        const decrypted = await decryptBool(
          provider,
          contractAddress,
          ciphertext,
          signer
        );

        toast.success('✅ Decrypted successfully!', { id: toastId });
        return decrypted;
      } catch (error: any) {
        if (error.code === 4001) {
          toast.error('❌ Signature rejected', { id: toastId });
        } else {
          toast.error('❌ Decryption failed', { id: toastId });
        }
        throw error;
      }
    },
    [walletClient, address, contractAddress]
  );

  return { decrypt };
}
