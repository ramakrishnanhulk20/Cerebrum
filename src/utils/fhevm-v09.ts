/**
 * FHEVM v0.9 Integration Utilities
 * Using @zama-fhe/relayer-sdk v0.3.0-5 (Official FHEVM SDK)
 * Handles createEncryptedInput, User Decryption with EIP-712 signatures
 */

import { BrowserProvider } from 'ethers';
import toast from 'react-hot-toast';

// Note: RelayerSDK is loaded from CDN (see index.html)
// Sepolia configuration is included in the SDK
let fhevmInstance: any = null;

/**
 * Initialize FHEVM v0.9 instance using RelayerSDK
 * Uses CDN-loaded @zama-fhe/relayer-sdk v0.3.0-5
 */
export async function initializeFhevm(provider: BrowserProvider): Promise<any> {
  if (fhevmInstance) {
    console.log('ℹ️ FHEVM instance already initialized, returning existing instance');
    return fhevmInstance;
  }

  console.log('🚀 Starting FHEVM v0.9 initialization...');
  console.log('📦 RelayerSDK version: 0.3.0-5');

  try {
    // Check if RelayerSDK is loaded from CDN
    console.log('🔍 Checking for RelayerSDK from CDN...');
    const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
    
    if (!sdk) {
      console.error('❌ RelayerSDK not found on window object');
      throw new Error(
        'RelayerSDK not loaded. Please include the CDN script tag in your HTML:\n' +
        '<script src="https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs"></script>'
      );
    }
    console.log('✅ RelayerSDK found on window object');

    const { initSDK, createInstance, SepoliaConfig } = sdk;
    console.log('📚 Extracted SDK methods:', { 
      hasInitSDK: !!initSDK, 
      hasCreateInstance: !!createInstance, 
      hasSepoliaConfig: !!SepoliaConfig 
    });

    // Initialize SDK from CDN
    console.log('⚙️ Initializing RelayerSDK...');
    await initSDK();
    console.log('✅ RelayerSDK initialized from CDN');
    
    // Get the ethereum provider from window
    if (!window.ethereum) {
      console.error('❌ window.ethereum not found');
      throw new Error('Ethereum provider not found. Please install MetaMask.');
    }
    console.log('✅ Ethereum provider found (MetaMask)');

    // Create config with Sepolia network and ethereum provider
    const config = { 
      ...SepoliaConfig, 
      network: window.ethereum 
    };
    console.log('🔧 FHEVM Config:', {
      network: 'Sepolia',
      gatewayUrl: SepoliaConfig?.gatewayUrl || 'gateway.sepolia.zama.dev',
      hasEthereumProvider: !!config.network
    });

    // Create FHEVM instance
    console.log('🏗️ Creating FHEVM instance...');
    fhevmInstance = await createInstance(config);
    console.log('✅ FHEVM v0.9 instance created successfully');
    console.log('📊 Instance methods available:', Object.keys(fhevmInstance));
    
    return fhevmInstance;
  } catch (error) {
    console.error('❌ Failed to initialize FHEVM:', error);
    console.error('🔍 Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    throw new Error('Failed to initialize FHEVM v0.9');
  }
}

/**
 * Get or create FHEVM instance
 */
export async function getFhevmInstance(provider: BrowserProvider): Promise<any> {
  if (!fhevmInstance) {
    return await initializeFhevm(provider);
  }
  return fhevmInstance;
}

/**
 * Create encrypted input for health data using RelayerSDK v0.3.0-5
 * Returns { handles, inputProof } for contract function call
 */
export async function createEncryptedHealthData(
  provider: BrowserProvider,
  contractAddress: string,
  userAddress: string,
  healthData: {
    bloodSugar: number;
    cholesterol: number;
    bmi: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    heartRate: number;
    weight: number;
    height: number;
  }
) {
  console.log('🔐 Starting health data encryption...');
  console.log('📋 Health data to encrypt:', {
    bloodSugar: healthData.bloodSugar,
    cholesterol: healthData.cholesterol,
    bmi: healthData.bmi,
    bloodPressureSystolic: healthData.bloodPressureSystolic,
    bloodPressureDiastolic: healthData.bloodPressureDiastolic,
    heartRate: healthData.heartRate,
    weight: healthData.weight,
    height: healthData.height
  });
  console.log('📍 Contract address:', contractAddress);
  console.log('👤 User address:', userAddress);

  try {
    const fhe = await getFhevmInstance(provider);
    console.log('✅ FHEVM instance retrieved');

    // Create encrypted input bundle using RelayerSDK
    console.log('🏗️ Creating encrypted input...');
    const input = fhe.createEncryptedInput(contractAddress, userAddress);

    // Add all health data fields as 64-bit encrypted integers (euint64)
    console.log('➕ Adding health data fields (64-bit encoding to match contract externalEuint64)...');
    input
      .add64(healthData.bloodSugar)
      .add64(healthData.cholesterol)
      .add64(healthData.bmi)
      .add64(healthData.bloodPressureSystolic)
      .add64(healthData.bloodPressureDiastolic)
      .add64(healthData.heartRate)
      .add64(healthData.weight)
      .add64(healthData.height);
    console.log('✅ All 8 fields added to encrypted input as euint64');

    // Encrypt and get result
    console.log('🔒 Encrypting data...');
    const encryptedData = await input.encrypt();
    
    console.log('✅ Encrypted health data created');
    console.log('🔍 Encrypted result structure:', {
      hasHandles: !!encryptedData.handles,
      handlesCount: encryptedData.handles?.length || 0,
      hasInputProof: !!encryptedData.inputProof,
      inputProofLength: encryptedData.inputProof?.length || 0
    });
    console.log('📦 Handles:', encryptedData.handles);
    console.log('📝 Input proof (first 100 chars):', 
      typeof encryptedData.inputProof === 'string' 
        ? encryptedData.inputProof.substring(0, 100) + '...' 
        : encryptedData.inputProof
    );

    // RelayerSDK returns object with handles and inputProof
    // Convert Uint8Array handles to hex strings for viem compatibility
    const hexHandles = encryptedData.handles?.map((handle: Uint8Array) => {
      // Convert Uint8Array to hex string with 0x prefix
      return '0x' + Array.from(handle)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }) || [];

    console.log('🔄 Converted handles to hex strings:', hexHandles.length);

    // Convert inputProof to hex string if it's a Uint8Array
    let hexInputProof = encryptedData.inputProof;
    if (hexInputProof instanceof Uint8Array) {
      hexInputProof = '0x' + Array.from(hexInputProof)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      console.log('🔄 Converted inputProof to hex string');
    }

    return {
      handles: hexHandles,
      inputProof: hexInputProof,
    };
  } catch (error) {
    console.error('❌ Failed to create encrypted input:', error);
    console.error('🔍 Error details:', {
      name: (error as Error).name,
      message: (error as Error).message
    });
    throw error;
  }
}

/**
 * Create encrypted threshold for lender eligibility check
 * Returns { handle, inputProof } for encrypted threshold
 */
export async function createEncryptedThreshold(
  provider: BrowserProvider,
  contractAddress: string,
  userAddress: string,
  threshold: number
) {
  console.log('🔐 Starting threshold encryption...');
  console.log('📊 Threshold value:', threshold);
  console.log('📍 Contract address:', contractAddress);
  console.log('👤 User address:', userAddress);

  try {
    const fhe = await getFhevmInstance(provider);
    console.log('✅ FHEVM instance retrieved');

    console.log('🏗️ Creating encrypted input for threshold...');
    const input = fhe.createEncryptedInput(contractAddress, userAddress);
    input.add64(threshold); // Use 64-bit to match contract externalEuint64
    console.log('✅ Threshold added to encrypted input (64-bit encoding)');

    console.log('🔒 Encrypting threshold...');
    const encryptedData = await input.encrypt();

    console.log('✅ Encrypted threshold created');
    console.log('🔍 Result structure:', {
      hasHandles: !!encryptedData.handles,
      handlesCount: encryptedData.handles?.length || 0,
      hasInputProof: !!encryptedData.inputProof
    });
    console.log('📦 Handle:', encryptedData.handles?.[0]);

    // Convert handle to hex string for viem compatibility
    let hexHandle = encryptedData.handles?.[0];
    if (hexHandle instanceof Uint8Array) {
      hexHandle = '0x' + Array.from(hexHandle)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      console.log('🔄 Converted handle to hex string');
    }

    // Convert inputProof to hex string if it's a Uint8Array
    let hexInputProof = encryptedData.inputProof;
    if (hexInputProof instanceof Uint8Array) {
      hexInputProof = '0x' + Array.from(hexInputProof)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      console.log('🔄 Converted inputProof to hex string');
    }

    return {
      handle: hexHandle || encryptedData,
      inputProof: hexInputProof || encryptedData,
    };
  } catch (error) {
    console.error('❌ Failed to create encrypted threshold:', error);
    console.error('🔍 Error details:', {
      name: (error as Error).name,
      message: (error as Error).message
    });
    throw error;
  }
}

/**
 * Decrypt euint64/euint8 value using User Decryption (EIP-712 signature)
 * This is INSTANT (0-2 seconds) using RelayerSDK v0.3.0-5
 * 
 * @param provider Ethers provider
 * @param contractAddress Contract that owns the encrypted value
 * @param ciphertext The encrypted value handle (bytes32)
 * @param signer Ethers signer for EIP-712 signature
 * @returns Decrypted number value
 */
export async function decryptUint64(
  provider: BrowserProvider,
  contractAddress: string,
  ciphertext: string,
  signer: any
): Promise<bigint> {
  console.log('🔓 Starting User Decryption (EIP-712)...');
  console.log('📍 Contract address:', contractAddress);
  console.log('🔑 Ciphertext handle:', ciphertext);
  
  // Get user address from walletClient (wagmi v2 format)
  const userAddress = signer.account?.address || (await signer.getAddress?.());
  console.log('👤 User address:', userAddress);

  try {
    const fhe = await getFhevmInstance(provider);
    console.log('✅ FHEVM instance retrieved');

    console.log('🔐 Using EIP-712 user decryption for handle:', ciphertext);
    
    // Generate keypair for decryption
    console.log('🔑 Generating decryption keypair...');
    const keypair = fhe.generateKeypair();
    console.log('✅ Keypair generated:', {
      hasPublicKey: !!keypair.publicKey,
      hasPrivateKey: !!keypair.privateKey,
      publicKeyLength: keypair.publicKey?.length || 0
    });
    
    // Prepare handle-contract pairs
    const handleContractPairs = [
      {
        handle: ciphertext,
        contractAddress: contractAddress,
      },
    ];
    console.log('📋 Handle-contract pairs prepared:', handleContractPairs);
    
    // Create EIP-712 signature request (valid for 10 days)
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10";
    const contractAddresses = [contractAddress];

    console.log('📝 Creating EIP-712 signature request...');
    console.log('⏰ Start timestamp:', startTimeStamp, '(', new Date(Number(startTimeStamp) * 1000).toISOString(), ')');
    console.log('📅 Duration:', durationDays, 'days');

    const eip712 = fhe.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );
    console.log('✅ EIP-712 message created:', {
      domain: eip712.domain,
      hasTypes: !!eip712.types,
      hasMessage: !!eip712.message
    });

    // Request user signature
    console.log('✍️ Requesting user signature...');
    console.log('⏳ Please sign the message in your wallet...');
    const signature = await signer.signTypedData({
      account: userAddress as `0x${string}`,
      domain: eip712.domain,
      types: {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      primaryType: 'UserDecryptRequestVerification',
      message: eip712.message
    });
    console.log('✅ Signature received:', signature.substring(0, 20) + '...');

    // Perform user decryption
    console.log('🔓 Performing user decryption via Gateway...');
    console.log('📋 Request payload:', {
      handles: handleContractPairs.map(h => h.handle),
      contractAddresses,
      userAddress,
      publicKey: keypair.publicKey.substring(0, 20) + '...',
      startTimeStamp,
      durationDays
    });
    
    // Verify EIP-712 signature locally
    console.log('🔍 Verifying EIP-712 signature...');
    try {
      const { verifyTypedData } = await import('ethers');
      const recovered = verifyTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
        signature
      );
      console.log('✅ Signature verified:', {
        recovered: recovered.toLowerCase(),
        expected: userAddress.toLowerCase(),
        match: recovered.toLowerCase() === userAddress.toLowerCase()
      });
      if (recovered.toLowerCase() !== userAddress.toLowerCase()) {
        console.error('❌ SIGNATURE MISMATCH! This will cause 500 error.');
      }
    } catch (sigErr) {
      console.warn('⚠️ Could not verify signature locally:', sigErr);
    }
    
    console.log('⏳ Waiting 3 seconds for ACL propagation...');
    // CRITICAL: Wait for coprocessors to propagate ACL updates to Gateway
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ ACL propagation delay complete');

    let result;
    try {
      result = await fhe.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        userAddress,
        startTimeStamp,
        durationDays
      );
    } catch (decryptErr: any) {
      console.error('❌ userDecrypt failed');
      console.error('🔍 Error object:', {
        name: decryptErr?.name,
        message: decryptErr?.message,
        code: decryptErr?.code,
        status: decryptErr?.status || decryptErr?.statusCode
      });
      
      // Try to extract response body
      if (decryptErr?.response) {
        try {
          const responseText = typeof decryptErr.response.text === 'function'
            ? await decryptErr.response.text()
            : JSON.stringify(decryptErr.response);
          console.error('📄 Relayer response body:', responseText);
        } catch (e) {
          console.error('⚠️ Could not read response body');
        }
      }
      
      console.error('💡 Debugging steps:');
      console.error('1. Check Network tab for POST /v1/user-decrypt response body');
      console.error('2. Verify handle exists on-chain and FHE.allow() was called');
      console.error('3. Check if signature verification passed above');
      console.error('4. Try increasing wait time to 30s for testnet');
      
      throw decryptErr;
    }

    const decrypted = Number(result[ciphertext]);
    console.log('✅ Decrypted value:', decrypted);
    console.log('🎯 Decryption completed successfully!');
    console.log('⏱️ Total time: ~0-2 seconds');
    
    return BigInt(decrypted);
  } catch (error: any) {
    console.error('❌ Failed to decrypt uint64');
    console.error('🔍 Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code
    });
    
    // Check for CORS error (localhost blocked by Zama testnet)
    if (error?.message?.includes('CORS') || 
        error?.message?.includes('Access-Control-Allow-Origin') ||
        error?.message?.includes('ERR_FAILED') ||
        error?.status === 520 ||
        error?.statusCode === 520) {
      console.error('🚨 CORS ERROR: Zama testnet relayer blocks localhost');
      throw new Error(
        'User Decryption blocked by CORS policy. ' +
        'Test on production: https://cerebrum-site.vercel.app'
      );
    }
    
    // Check for relayer/network error
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      console.error('🌐 Network error: Gateway service unavailable');
      throw new Error('Decryption service is temporarily unavailable. Please try again later.');
    }
    throw error;
  }
}

/**
 * Decrypt ebool value using User Decryption (EIP-712 signature)
 * Used for lender eligibility results (TRUE/FALSE only)
 */
/**
 * Decrypt ebool (boolean) value
 * Used for eligibility checks (TRUE/FALSE only)
 * NOW WITH SIGNATURE CACHING - User signs once, valid for 365 days!
 */
export async function decryptBool(
  provider: BrowserProvider,
  contractAddress: string,
  ciphertext: string,
  signer: any
): Promise<boolean> {
  console.log('🔓 Starting Boolean Decryption (EIP-712)...');
  console.log('📍 Contract address:', contractAddress);
  console.log('🔑 Ciphertext handle:', ciphertext);

  try {
    const fhe = await getFhevmInstance(provider);
    console.log('✅ FHEVM instance retrieved');

    console.log('🔐 Using EIP-712 user decryption for bool handle:', ciphertext);
    
    // Load or create signature (CACHED for 365 days!)
    const { LocalStorageWrapper, loadOrSignDecryptionSignature } = await import('./signatureStorage');
    const storage = new LocalStorageWrapper('cerebrum_decrypt_');
    const userAddress = await signer.getAddress();
    
    console.log('🔑 Getting or creating decryption signature (cached 365 days)...');
    const sigData = await loadOrSignDecryptionSignature(
      storage,
      fhe,
      [contractAddress],
      userAddress,
      signer
    );
    console.log('✅ Signature ready (cached:', sigData.startTimestamp !== Math.floor(Date.now() / 1000), ')');

    const handleContractPairs = [
      {
        handle: ciphertext,
        contractAddress: contractAddress,
      },
    ];

    console.log('🔓 Performing user decryption via Gateway...');
    console.log('📋 Request payload:', {
      handle: ciphertext,
      contractAddress,
      userAddress,
      publicKey: sigData.publicKey.substring(0, 20) + '...',
      startTimestamp: sigData.startTimestamp
    });
    
    console.log('⏳ Waiting 3 seconds for ACL propagation...');
    // CRITICAL: Wait for coprocessors to propagate ACL updates to Gateway
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ ACL propagation delay complete');
    
    let result;
    try {
      result = await fhe.userDecrypt(
        handleContractPairs,
        sigData.privateKey,
        sigData.publicKey,
        sigData.signature,
        sigData.contractAddresses,
        sigData.userAddress,
        sigData.startTimestamp.toString(),
        sigData.durationDays.toString()
      );
    } catch (decryptErr: any) {
      console.error('❌ userDecrypt (bool) failed');
      console.error('🔍 Error details:', {
        message: decryptErr?.message,
        status: decryptErr?.status || decryptErr?.statusCode
      });
      
      // Try to capture response body
      if (decryptErr?.response) {
        try {
          const responseText = typeof decryptErr.response.text === 'function'
            ? await decryptErr.response.text()
            : JSON.stringify(decryptErr.response);
          console.error('📄 Relayer response body:', responseText);
        } catch (e) {
          console.error('⚠️ Could not read response body');
        }
      }
      
      console.error('💡 Check Network tab for full response details');
      throw decryptErr;
    }

    const decrypted = Boolean(result[ciphertext]);
    console.log('✅ Decrypted bool:', decrypted);
    console.log('🎯 Boolean decryption completed successfully!');
    
    return decrypted;
  } catch (error: any) {
    console.error('❌ Failed to decrypt bool');
    console.error('🔍 Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code
    });

    // Check for CORS error (localhost blocked by Zama testnet)
    if (error?.message?.includes('CORS') || 
        error?.message?.includes('Access-Control-Allow-Origin') ||
        error?.message?.includes('ERR_FAILED') ||
        error?.status === 520 ||
        error?.statusCode === 520) {
      console.error('🚨 CORS ERROR: Zama testnet relayer blocks localhost');
      throw new Error(
        'User Decryption blocked by CORS policy. ' +
        'Test on production: https://cerebrum-site.vercel.app'
      );
    }

    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      console.error('🌐 Network error: Gateway service unavailable');
      throw new Error('Decryption service is temporarily unavailable. Please try again later.');
    }
    throw error;
  }
}

/**
 * Batch decrypt multiple euint64/euint8 values
 * Used for decrypting full health records (8 values at once)
 * NOW WITH SIGNATURE CACHING - User signs once, valid for 365 days!
 */
export async function batchDecryptUint64(
  provider: BrowserProvider,
  contractAddress: string,
  ciphertexts: string[],
  signer: any
): Promise<bigint[]> {
  console.log('🔓 Starting Batch User Decryption (EIP-712)...');
  console.log('📊 Number of values to decrypt:', ciphertexts.length);
  console.log('📍 Contract address:', contractAddress);
  console.log('🔑 Ciphertext handles:', ciphertexts);

  // Filter out undefined/null handles but keep track of positions
  const handlePositions: number[] = [];
  const validHandles = ciphertexts.filter((h, i) => {
    if (!h || h === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return false;
    }
    handlePositions.push(i);
    return true;
  });

  if (validHandles.length === 0) {
    throw new Error('Cannot decrypt: No valid encrypted handles found.');
  }

  console.log(`📊 Decrypting ${validHandles.length} of ${ciphertexts.length} fields (${ciphertexts.length - validHandles.length} fields are empty)`);

  try {
    const fhe = await getFhevmInstance(provider);
    console.log('✅ FHEVM instance retrieved');

    console.log('🔐 Batch user decryption for handles:', validHandles);
    
    // Load or create signature (CACHED for 365 days!)
    const { LocalStorageWrapper, loadOrSignDecryptionSignature } = await import('./signatureStorage');
    const storage = new LocalStorageWrapper('cerebrum_decrypt_');
    const userAddress = await signer.getAddress();
    
    console.log('🔑 Getting or creating decryption signature (cached 365 days)...');
    const sigData = await loadOrSignDecryptionSignature(
      storage,
      fhe,
      [contractAddress],
      userAddress,
      signer
    );
    console.log('✅ Signature ready (cached:', sigData.startTimestamp !== Math.floor(Date.now() / 1000), ')');

    const handleContractPairs = validHandles.map(handle => ({
      handle,
      contractAddress: contractAddress,
    }));
    console.log('📋 Handle-contract pairs prepared:', handleContractPairs.length, 'pairs');

    console.log('🔓 Performing batch user decryption via Gateway...');
    console.log('📋 Request payload:', {
      handleCount: validHandles.length,
      handles: validHandles,
      contractAddress,
      userAddress,
      publicKey: sigData.publicKey.substring(0, 20) + '...'
    });
    
    console.log('⏳ Waiting 3 seconds for ACL propagation...');
    // CRITICAL: Wait for coprocessors to propagate ACL updates to Gateway
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ ACL propagation delay complete');
    
    let result;
    try {
      result = await fhe.userDecrypt(
        handleContractPairs,
        sigData.privateKey,
        sigData.publicKey,
        sigData.signature,
        sigData.contractAddresses,
        sigData.userAddress,
      sigData.startTimestamp.toString(),
      sigData.durationDays.toString()
    );
    } catch (decryptErr: any) {
      console.error('❌ Batch userDecrypt failed');
      console.error('🔍 Error details:', {
        message: decryptErr?.message,
        status: decryptErr?.status || decryptErr?.statusCode,
        handleCount: validHandles.length
      });
      
      // Try to capture response body
      if (decryptErr?.response) {
        try {
          const responseText = typeof decryptErr.response.text === 'function'
            ? await decryptErr.response.text()
            : JSON.stringify(decryptErr.response);
          console.error('📄 Relayer response body:', responseText);
        } catch (e) {
          console.error('⚠️ Could not read response body');
        }
      }
      
      console.error('💡 Debugging steps:');
      console.error('1. Check Network tab for POST /v1/user-decrypt response body');
      console.error('2. Verify all', validHandles.length, 'handles have FHE.allow() permissions');
      console.error('3. Try increasing wait time to 30s for testnet');
      throw decryptErr;
    }

    // Convert result to array of BigInts, filling in original positions
    const decryptedValues: bigint[] = new Array(ciphertexts.length).fill(0n);
    validHandles.forEach((handle, validIndex) => {
      const originalIndex = handlePositions[validIndex];
      const value = BigInt(Number(result[handle]));
      decryptedValues[originalIndex] = value;
      console.log(`  ✅ Decrypted value ${originalIndex + 1}/${ciphertexts.length}:`, Number(value));
    });
    
    console.log(`✅ Batch decrypted ${validHandles.length} of ${ciphertexts.length} values successfully!`);
    console.log('🎯 All values:', decryptedValues.map(v => Number(v)));
    console.log('⏱️ Total time: ~1-2 seconds for batch');
    
    return decryptedValues;
  } catch (error: any) {
    console.error('❌ Failed to batch decrypt');
    console.error('🔍 Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      attemptedCount: validHandles.length
    });

    // Check for CORS error (localhost blocked by Zama testnet)
    if (error?.message?.includes('CORS') || 
        error?.message?.includes('Access-Control-Allow-Origin') ||
        error?.message?.includes('ERR_FAILED') ||
        error?.status === 520 ||
        error?.statusCode === 520) {
      console.error('🚨 CORS ERROR DETECTED');
      console.error('📍 The Zama testnet relayer blocks requests from localhost origins');
      console.error('💡 Solutions:');
      console.error('   1. Deploy to production and test there (RECOMMENDED)');
      console.error('   2. Test on existing deployment: https://cerebrum-site.vercel.app');
      console.error('   3. Contact Zama to request localhost whitelist for development');
      throw new Error(
        'User Decryption blocked by CORS policy. The Zama testnet relayer does not allow localhost requests. ' +
        'Please test on production deployment: https://cerebrum-site.vercel.app'
      );
    }

    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      console.error('🌐 Network error: Gateway service unavailable');
      throw new Error('Decryption service is temporarily unavailable. Please try again later.');
    }
    
    if (error?.message?.includes('500') || error?.message?.includes('Internal Server Error')) {
      console.error('🔒 Relayer error - possible ACL permission issue');
      throw new Error('Unable to decrypt: Permission may not have been granted yet. Try calling getEncryptedHealthRecord() first or wait a few seconds for the transaction to confirm.');
    }
    
    throw error;
  }
}

/**
 * Check if user has FHE.allow() permission for a ciphertext
 * Returns true if user can decrypt the value
 */
export async function hasDecryptPermission(
  provider: BrowserProvider,
  contractAddress: string,
  ciphertext: string,
  signer: any
): Promise<boolean> {
  try {
    const fhe = await getFhevmInstance(provider);
    
    // Try to decrypt - if it fails, user doesn't have permission
    const keypair = fhe.generateKeypair();
    const handleContractPairs = [{ handle: ciphertext, contractAddress }];
    
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10";
    const contractAddresses = [contractAddress];

    const eip712 = fhe.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );

    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    );

    await fhe.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      await signer.getAddress(),
      startTimeStamp,
      durationDays
    );
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Format decrypted health score for display
 * Converts bigint to number and clamps to valid range (500-850)
 */
export function formatHealthScore(decryptedValue: bigint): number {
  const score = Number(decryptedValue);
  return Math.max(500, Math.min(850, score));
}

/**
 * Format decrypted risk score for display
 * Risk scores are 0-100 percentages
 */
export function formatRiskScore(decryptedValue: bigint): number {
  // Risk scores are stored as integers representing (percentage × 10)
  // e.g., 404 = 40.4%, 500 = 50.0%, 615 = 61.5%
  // Frontend divides by 10 for display, so we return the raw value
  const score = Number(decryptedValue);
  return Math.max(0, Math.min(1000, score)); // Max 100.0% = 1000
}

/**
 * Convert Wagmi provider to Ethers BrowserProvider
 * Required for fhevmjs integration
 */
export function wagmiToEthersProvider(walletClient: any): BrowserProvider {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  
  const provider = new BrowserProvider(transport, network);
  return provider;
}

/**
 * Helper: Wait for user to sign EIP-712 decryption request
 * Shows user-friendly message while waiting
 */
export async function waitForDecryptionSignature(
  decryptFn: () => Promise<any>,
  toastMessage: string = 'Please sign the decryption request in your wallet...'
): Promise<any> {
  return new Promise((resolve, reject) => {
    const toastId = toast.loading(toastMessage);
    
    decryptFn()
      .then(result => {
        toast.success('✅ Decrypted successfully!', { id: toastId });
        resolve(result);
      })
      .catch(error => {
        if (error.code === 4001) {
          toast.error('❌ User rejected signature request', { id: toastId });
        } else {
          toast.error('❌ Decryption failed', { id: toastId });
        }
        reject(error);
      });
  });
}

// Export types
export type EncryptedHealthData = {
  handles: string[];
  inputProof: string;
};

export type EncryptedThreshold = {
  handle: string;
  inputProof: string;
};
