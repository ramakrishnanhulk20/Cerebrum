/**
 * Generic string storage wrapper for FHE decryption signatures
 * Matches Zama's GenericStringStorage pattern for caching EIP-712 signatures
 * 
 * Signatures are valid for 365 days and allow reuse across multiple decryption calls
 * without requiring the user to sign repeatedly.
 */

export interface GenericStringStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * LocalStorage implementation of GenericStringStorage
 * Uses browser localStorage with async interface for consistency
 */
export class LocalStorageWrapper implements GenericStringStorage {
  private prefix: string;

  constructor(prefix: string = 'fhevm_') {
    this.prefix = prefix;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(this.prefix + key);
    } catch (error) {
      console.warn('LocalStorage getItem failed:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, value);
    } catch (error) {
      console.error('LocalStorage setItem failed:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('LocalStorage removeItem failed:', error);
    }
  }
}

/**
 * FHE Decryption Signature Type
 * Stores the signature and metadata needed for userDecrypt() calls
 */
export interface FhevmDecryptionSignature {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number; // Unix timestamp in seconds
  durationDays: number;
  userAddress: string;
  contractAddresses: string[];
}

/**
 * Generate a unique storage key for a signature
 * Key is based on user address + contract addresses hash
 */
export function generateSignatureStorageKey(
  userAddress: string,
  contractAddresses: string[]
): string {
  const sortedAddresses = [...contractAddresses].sort();
  const addressString = sortedAddresses.join(',');
  
  // Simple hash for the key
  let hash = 0;
  for (let i = 0; i < addressString.length; i++) {
    const char = addressString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `${userAddress.toLowerCase()}_${hash}`;
}

/**
 * Check if a signature is still valid
 */
export function isSignatureValid(sig: FhevmDecryptionSignature): boolean {
  const now = Math.floor(Date.now() / 1000);
  const expirationTime = sig.startTimestamp + (sig.durationDays * 24 * 60 * 60);
  return now < expirationTime;
}

/**
 * Save a signature to storage
 */
export async function saveSignature(
  storage: GenericStringStorage,
  signature: FhevmDecryptionSignature
): Promise<void> {
  const key = generateSignatureStorageKey(
    signature.userAddress,
    signature.contractAddresses
  );
  
  const value = JSON.stringify(signature);
  await storage.setItem(key, value);
  
  console.log('✅ Signature cached for 365 days:', key);
}

/**
 * Load a signature from storage
 * Returns null if not found or expired
 */
export async function loadSignature(
  storage: GenericStringStorage,
  userAddress: string,
  contractAddresses: string[]
): Promise<FhevmDecryptionSignature | null> {
  const key = generateSignatureStorageKey(userAddress, contractAddresses);
  
  try {
    const value = await storage.getItem(key);
    if (!value) {
      console.log('ℹ️ No cached signature found');
      return null;
    }
    
    const sig = JSON.parse(value) as FhevmDecryptionSignature;
    
    if (!isSignatureValid(sig)) {
      console.log('⚠️ Cached signature expired, will create new one');
      await storage.removeItem(key);
      return null;
    }
    
    console.log('✅ Using cached signature (valid for', sig.durationDays, 'days)');
    return sig;
  } catch (error) {
    console.warn('Failed to load signature from storage:', error);
    return null;
  }
}

/**
 * Create a new signature with EIP-712 signing
 * Works with both Wagmi WalletClient and Ethers Signer
 */
export async function createNewSignature(
  fhevmInstance: any,
  contractAddresses: string[],
  userAddress: string,
  signer: any
): Promise<FhevmDecryptionSignature> {
  console.log('🔑 Generating new keypair...');
  const { publicKey, privateKey } = fhevmInstance.generateKeypair();
  
  const startTimestamp = Math.floor(Date.now() / 1000);
  const durationDays = 365; // Signature valid for 1 year
  
  console.log('📝 Creating EIP-712 signature request...');
  const sortedAddresses = [...contractAddresses].sort();
  
  const eip712 = fhevmInstance.createEIP712(
    publicKey,
    sortedAddresses,
    startTimestamp.toString(),
    durationDays.toString()
  );
  
  console.log('🖊️ Requesting user signature (valid for 365 days)...');
  
  let signature: string;
  
  // Check if it's a Wagmi WalletClient (has signTypedData with account param)
  if (signer.signTypedData && signer.account) {
    const { EIP712Domain, ...typesWithoutDomain } = eip712.types;
    
    const sig = await signer.signTypedData({
      account: userAddress as `0x${string}`,
      domain: eip712.domain,
      types: typesWithoutDomain,
      primaryType: eip712.primaryType,
      message: eip712.message,
    });
    
    signature = sig;
  } 
  // Otherwise it's an Ethers Signer (old pattern)
  else {
    const sig = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    );
    
    signature = sig;
  }
  
  console.log('✅ Signature obtained');
  
  return {
    publicKey,
    privateKey,
    signature: signature.replace('0x', ''),
    startTimestamp,
    durationDays,
    userAddress,
    contractAddresses: sortedAddresses,
  };
}

/**
 * Load existing signature or create new one (with caching)
 * This is the main function to use - matches Zama's loadOrSign pattern
 */
export async function loadOrSignDecryptionSignature(
  storage: GenericStringStorage,
  fhevmInstance: any,
  contractAddresses: string[],
  userAddress: string,
  signer: any
): Promise<FhevmDecryptionSignature> {
  // Try to load cached signature
  const cached = await loadSignature(storage, userAddress, contractAddresses);
  
  if (cached) {
    return cached;
  }
  
  // Create new signature
  const newSig = await createNewSignature(
    fhevmInstance,
    contractAddresses,
    userAddress,
    signer
  );
  
  // Save to cache
  await saveSignature(storage, newSig);
  
  return newSig;
}
