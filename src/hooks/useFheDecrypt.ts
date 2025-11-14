/**
 * React hooks for FHE decryption operations
 * Provides a clean, wagmi-like API for client-side FHE operations
 * 
 * UPDATED: Now with signature caching (matches Zama's official pattern)
 * - Signatures cached for 365 days in localStorage
 * - User only signs EIP-712 once per year
 * - Batch decryption support with single signature
 */

import { useState, useCallback, useMemo } from 'react';
import { decryptUint64, decryptBool, batchDecryptUint64 as batchDecrypt, initializeFhevm as initFhevm } from '../utils/fhevm-v09';
import { BrowserProvider } from 'ethers';

// Wrapper to match the hook's expected signature
async function decryptValue(
  handle: string,
  contractAddress: string,
  userAddress: string,
  walletClient: any
): Promise<bigint> {
  // WalletClient from wagmi - need to get provider
  const provider = new BrowserProvider(walletClient);
  return decryptUint64(provider, contractAddress, handle, walletClient);
}

// Wrapper for decryptValues to match old API
async function decryptValues(
  handles: string[],
  contractAddress: string,
  userAddress: string,
  signer: any
): Promise<bigint[]> {
  const provider = signer?.provider;
  if (!provider) throw new Error('Provider not available');
  return batchDecrypt(handles, contractAddress, userAddress, signer);
}

/**
 * Hook for decrypting euint64 values
 */
export function useDecryptUint64() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<bigint | null>(null);

  const decrypt = useCallback(async (
    handle: string,  // v0.9: handles are hex strings
    contractAddress: string,
    userAddress: string,
    signer: any
  ) => {
    setIsDecrypting(true);
    setError(null);
    setData(null);

    try {
      const result = await decryptValue(handle, contractAddress, userAddress, signer);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Decryption failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsDecrypting(false);
    setError(null);
    setData(null);
  }, []);

  return {
    decrypt,
    isDecrypting,
    error,
    data,
    reset,
  };
}

/**
 * Hook for decrypting ebool values
 */
export function useDecryptBool() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<boolean | null>(null);

  const decrypt = useCallback(async (
    handle: string,  // v0.9: handles are hex strings
    contractAddress: string,
    userAddress: string,
    signer: any
  ) => {
    setIsDecrypting(true);
    setError(null);
    setData(null);

    try {
      const result = await decryptBool(handle, contractAddress, userAddress, signer);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Decryption failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsDecrypting(false);
    setError(null);
    setData(null);
  }, []);

  return {
    decrypt,
    isDecrypting,
    error,
    data,
    reset,
  };
}

/**
 * Hook for batch decrypting multiple values
 * IMPROVED: Uses single cached signature for all handles
 */
export function useBatchDecrypt() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<bigint[] | null>(null);  // v0.9: returns array

  const decrypt = useCallback(async (
    handles: string[],  // v0.9: handles are hex strings
    contractAddress: string,
    userAddress: string,
    signer: any
  ) => {
    setIsDecrypting(true);
    setError(null);
    setData(null);

    try {
      const result = await batchDecrypt(handles, contractAddress, userAddress, signer);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Batch decryption failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsDecrypting(false);
    setError(null);
    setData(null);
  }, []);

  return {
    decrypt,
    isDecrypting,
    error,
    data,
    reset,
  };
}

/**
 * Hook matching Zama's useFHEDecrypt pattern
 * Supports multiple handles and returns results object keyed by handle
 * Automatically manages signature caching
 */
export interface FHEDecryptRequest {
  handle: string;  // v0.9: hex string handle
  contractAddress: string;
}

export function useFHEDecrypt(params: {
  requests?: FHEDecryptRequest[];
  userAddress?: string;
  signer?: any;
}) {
  const { requests, userAddress, signer } = params;
  
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, bigint>>({});  // v0.9: simplified return type
  const [message, setMessage] = useState<string>('');

  // Check if we can decrypt
  const canDecrypt = useMemo(() => {
    return Boolean(
      requests && 
      requests.length > 0 && 
      userAddress && 
      signer && 
      !isDecrypting
    );
  }, [requests, userAddress, signer, isDecrypting]);

  const decrypt = useCallback(async () => {
    if (!canDecrypt || !requests || !userAddress || !signer) {
      return;
    }

    setIsDecrypting(true);
    setError(null);
    setMessage('Starting decryption...');

    try {
      // Group requests by contract address
      const byContract = requests.reduce((acc, req) => {
        if (!acc[req.contractAddress]) {
          acc[req.contractAddress] = [];
        }
        acc[req.contractAddress].push(req.handle);
        return acc;
      }, {} as Record<string, string[]>);  // v0.9: string handles

      // Decrypt each contract's handles
      const allResults: Record<string, bigint> = {};
      
      for (const [contractAddress, handles] of Object.entries(byContract)) {
        setMessage(`Decrypting ${handles.length} values from ${contractAddress.slice(0, 10)}...`);
        
        const contractResults = await decryptValues(
          handles,
          contractAddress,
          userAddress,
          signer
        );
        
        // Map results back to handles
        handles.forEach((handle, index) => {
          allResults[handle] = contractResults[index];
        });
      }

      setResults(allResults);
      setMessage(`✅ Decrypted ${Object.keys(allResults).length} values`);
    } catch (err: any) {
      const errorMessage = err?.message || 'Decryption failed';
      setError(errorMessage);
      setMessage(`❌ ${errorMessage}`);
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, [canDecrypt, requests, userAddress, signer]);

  const reset = useCallback(() => {
    setIsDecrypting(false);
    setError(null);
    setResults({});
    setMessage('');
  }, []);

  return {
    canDecrypt,
    decrypt,
    isDecrypting,
    error,
    results,
    message,
    reset,
  };
}

/**
 * Hook for initializing FHEVM
 */
export function useFhevm() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (isReady) return; // Already initialized

    setIsInitializing(true);
    setError(null);

    try {
      await initFhevm();
      setIsReady(true);
    } catch (err: any) {
      const errorMessage = err?.message || 'FHEVM initialization failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsInitializing(false);
    }
  }, [isReady]);

  return {
    initialize,
    isInitializing,
    isReady,
    error,
  };
}
