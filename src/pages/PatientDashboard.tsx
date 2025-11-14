import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Activity, 
  Award, 
  DollarSign, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Users, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertCircle,
  Heart,
  Droplet,
  Scale,
  Gauge,
  User,
  Calendar,
  Moon,
  Dumbbell,
  ExternalLink,
  Loader,
  Shield,
  XCircle,
  UserX
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts-v09';
import { formatEther, parseEther, isAddress } from 'viem';
import confetti from 'canvas-confetti';
import { useFhevm, useDecryptUint64 } from '../hooks/useFheDecrypt';
import { usePatientFhevm } from '../hooks/useFhevmV09';
import { useWalletClient } from 'wagmi';

const DATA_SHARE_REWARD = parseEther('0.001');

// Animated Number Counter
const AnimatedNumber = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

// Confetti Effect
const triggerConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#00e6a0', '#34d399', '#22c55e', '#6ee7b7'],
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
};

// Transaction Loading Modal
const TransactionModal = ({ 
  show, 
  txHash, 
  title = "Processing Transaction" 
}: { 
  show: boolean; 
  txHash?: string; 
  title?: string;
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/30 rounded-2xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <Loader className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
            <p className="text-gray-400 mb-6">Please wait while your transaction is being processed...</p>
            
            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View on Etherscan
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const PatientDashboard = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  // FHE Decryption Hooks
  const { decrypt: decryptScore, isDecrypting: isInstantDecrypting, error: decryptError, data: decryptedData, reset: resetDecrypt } = useDecryptUint64();
  
  // FHEVM v0.9 Hooks
  const { encryptHealthData, decryptHealthScore } = usePatientFhevm(CEREBRUM_CONTRACT_ADDRESS);
  
  // Health Data State - EXPANDED
  const [bloodSugar, setBloodSugar] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [bmi, setBmi] = useState('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  
  const [lenderAddress, setLenderAddress] = useState('');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [approvedLenders, setApprovedLenders] = useState<Array<{address: string, timestamp: number}>>([]);
  const [loadingLenders, setLoadingLenders] = useState(false);
  
  const publicClient = usePublicClient();
  
  // Client-side decryption state
  const [instantDecryptedScore, setInstantDecryptedScore] = useState<number | null>(null);

  // Read patient data
  const { data: patientInfo, refetch: refetchPatient } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientInfo',
    args: address ? [address] : undefined,
  });

  // NEW: Get encrypted health score handle for v09 contract
  const { data: healthScoreHandle, refetch: refetchHealthScore } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getEncryptedHealthScore',
    args: address ? [address] : undefined,
  });

  const { data: activityLogs } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientActivity',
    args: address ? [address] : undefined,
  });

  // Get patient struct which includes encrypted healthScore
  // The public mapping accessor returns the full struct
  const { data: patientStruct } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'patients',
    args: address ? [address] : undefined,
  });

  // Write functions
  const { writeContract: register, data: registerHash, isPending: isRegisteringPending } = useWriteContract();
  const { writeContract: shareData, data: shareHash, isPending: isSharingPending } = useWriteContract();
  const { writeContract: toggleSharing, data: toggleHash, isPending: isTogglingPending } = useWriteContract();
  const { writeContract: approveLender, data: approveLenderHash, isPending: isApprovingLender } = useWriteContract();
  const { writeContract: revokeLenderAccess, data: revokeLenderHash, isPending: isRevokingLender } = useWriteContract();
  const { writeContract: claimEarnings, data: claimHash, isPending: isClaimingPending } = useWriteContract();
  const { writeContract: enableInstantDecrypt, data: enableInstantHash, isPending: isEnablingInstant } = useWriteContract();

  const { isLoading: isRegistering, isSuccess: registerSuccess } = useWaitForTransactionReceipt({ hash: registerHash });
  const { isLoading: isSharing, isSuccess: shareSuccess, isError: shareError } = useWaitForTransactionReceipt({ hash: shareHash });
  const { isLoading: isToggling, isSuccess: toggleSuccess } = useWaitForTransactionReceipt({ hash: toggleHash });
  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveLenderHash });
  const { isLoading: isApprovingLenderTx } = useWaitForTransactionReceipt({ hash: approveLenderHash });
  const { isLoading: isRevokingLenderTx, isSuccess: revokeSuccess } = useWaitForTransactionReceipt({ hash: revokeLenderHash });
  const { isLoading: isClaiming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });
  const { isLoading: isEnablingInstantDecrypt, isSuccess: enableInstantSuccess } = useWaitForTransactionReceipt({ hash: enableInstantHash });

  // Success effects
  useEffect(() => {
    if (shareSuccess) {
      triggerConfetti();
      toast.success('🎉 Health data shared! Score re-encrypted automatically!');
      refetchPatient();
      refetchHealthScore(); // Refetch the latest encrypted health score handle
      // Clear form
      setBloodSugar('');
      setCholesterol('');
      setBmi('');
      setBloodPressureSystolic('');
      setBloodPressureDiastolic('');
      setHeartRate('');
      setWeight('');
      setHeight('');
      setAge('');
      setExerciseMinutes('');
      setSleepHours('');
      // Clear decrypted scores so user needs to decrypt again
      setDecryptedScore(null);
      setInstantDecryptedScore(null);
    }
  }, [shareSuccess]);

  // Error effects
  useEffect(() => {
    if (shareError) {
      toast.error('❌ Transaction failed! Please check the console for details.');
    }
  }, [shareError]);

  useEffect(() => {
    if (enableInstantSuccess) {
      triggerConfetti();
      toast.success('⚡ Instant decrypt enabled! FHE.allow() permission granted. You can now decrypt instantly (2-5s)!');
      refetchPatient();
      // Removed refetchInstantDecryptStatus as it's not available in v0.9
    }
  }, [enableInstantSuccess]);

  // Fetch approved lenders from contract events
  useEffect(() => {
    const fetchApprovedLenders = async () => {
      if (!address || !publicClient) return;
      
      setLoadingLenders(true);
      try {
        // Get LenderApprovalGranted events
        const grantedLogs = await publicClient.getLogs({
          address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'LenderApprovalGranted',
            inputs: [
              { type: 'address', indexed: true, name: 'patient' },
              { type: 'address', indexed: true, name: 'lender' },
              { type: 'uint256', indexed: false, name: 'timestamp' },
            ],
          },
          args: {
            patient: address,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        });

        // Get LenderApprovalRevoked events
        const revokedLogs = await publicClient.getLogs({
          address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'LenderApprovalRevoked',
            inputs: [
              { type: 'address', indexed: true, name: 'patient' },
              { type: 'address', indexed: true, name: 'lender' },
              { type: 'uint256', indexed: false, name: 'timestamp' },
            ],
          },
          args: {
            patient: address,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        });

        // Build map of lender approvals
        const lenderMap = new Map<string, {address: string, timestamp: number, revoked: boolean}>();
        
        // Process granted events
        grantedLogs.forEach((log: any) => {
          const lenderAddr = log.args.lender as string;
          const timestamp = Number(log.args.timestamp);
          lenderMap.set(lenderAddr.toLowerCase(), {
            address: lenderAddr,
            timestamp,
            revoked: false,
          });
        });

        // Process revoked events (mark as revoked)
        revokedLogs.forEach((log: any) => {
          const lenderAddr = log.args.lender as string;
          const existing = lenderMap.get(lenderAddr.toLowerCase());
          if (existing) {
            existing.revoked = true;
          }
        });

        // Filter out revoked lenders
        const activeLenders = Array.from(lenderMap.values())
          .filter(l => !l.revoked)
          .sort((a, b) => b.timestamp - a.timestamp);

        setApprovedLenders(activeLenders);
      } catch (error) {
        console.error('Error fetching approved lenders:', error);
      } finally {
        setLoadingLenders(false);
      }
    };

    fetchApprovedLenders();
  }, [address, publicClient, registerSuccess, approveSuccess, revokeSuccess]);

  useEffect(() => {
    if (registerSuccess) {
      triggerConfetti();
      toast.success('✅ Registration successful! Welcome to Cerebrum!');
      refetchPatient();
    }
  }, [registerSuccess]);

  useEffect(() => {
    if (claimSuccess) {
      triggerConfetti();
      toast.success('💰 Earnings claimed successfully!');
      refetchPatient();
    }
  }, [claimSuccess]);

  useEffect(() => {
    if (revokeSuccess) {
      toast.success('🔒 Lender access revoked successfully!');
      refetchPatient();
    }
  }, [revokeSuccess]);

  useEffect(() => {
    if (toggleSuccess) {
      toast.success('Data sharing preference updated!');
      refetchPatient();
    }
  }, [toggleSuccess]);

  useEffect(() => {
    if (approveSuccess) {
      toast.success('✅ Lender approved successfully!');
      setLenderAddress('');
      refetchPatient(); // Refresh to show in the list
    }
  }, [approveSuccess]);

  // Extract patient data
  const isRegistered = patientInfo?.[0] as boolean;
  const sharingEnabled = patientInfo?.[1] as boolean;
  const lastDataShare = patientInfo?.[2] ? Number(patientInfo[2]) : 0;
  const registrationTime = patientInfo?.[3] ? Number(patientInfo[3]) : 0;
  const dataShareCount = patientInfo?.[4] ? Number(patientInfo[4]) : 0;
  const totalEarnings = patientInfo?.[5] ? patientInfo[5] : BigInt(0);

  // Score state for v0.9 (manual tracking)
  const [decryptedScore, setDecryptedScore] = useState<number | null>(null);
  const [isDecryptingScore, setIsDecryptingScore] = useState(false);

  // Watch for updates (simplified for v09)
  useEffect(() => {
    // TODO: Add score decryption logic when needed
  }, []);

  // Get last 3 activity logs (any transactions)
  const recentTransactions = activityLogs ? (activityLogs as any[]).slice(-3).reverse() : [];
  
  // Get last 3 health data shares specifically
  const healthDataTransactions = activityLogs 
    ? (activityLogs as any[]).filter((log: any) => log.action === "Health Data Shared").slice(-3).reverse()
    : [];

  // Handle functions
  const handleRegister = () => {
    register({
      address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
      abi: CEREBRUM_ABI,
      functionName: 'registerPatient',
      gas: 5000000n, // Set gas limit under network cap
    } as any);
  };

  const handleShareData = async () => {
    if (!isRegistered) {
      toast.error('Please register as a patient first');
      return;
    }

    if (!bloodSugar || !cholesterol || !bmi) {
      toast.error('Please fill in all basic health metrics');
      return;
    }

    if (!shareData) {
      toast.error('Write function not available. Make sure your wallet is connected.');
      return;
    }

    try {
      console.log('🔐 Starting FHEVM health data encryption...');
      
      // Prepare health data for encryption
      const healthData = {
        bloodSugar: Number(bloodSugar),
        cholesterol: Number(cholesterol),
        bmi: Number(bmi),
        bloodPressureSystolic: Number(bloodPressureSystolic || 0),
        bloodPressureDiastolic: Number(bloodPressureDiastolic || 0),
        heartRate: Number(heartRate || 0),
        weight: Number(weight || 0),
        height: Number(height || 0),
      };

      console.log('📊 Health data to encrypt:', healthData);

      // Encrypt health data using FHEVM
      const encrypted = await encryptHealthData(healthData);
      console.log('✅ Health data encrypted successfully');
      console.log('📦 Encrypted handles:', encrypted.handles);
      console.log('📝 Input proof length:', encrypted.inputProof.length);

      // Contract expects 12 params: 8 encrypted handles + age + exerciseMinutes + sleepHours + inputProof
      const args = [
        // 8 encrypted health data handles
        ...encrypted.handles,
        // 3 plaintext parameters
        Number(age || 0),        // uint8
        Number(exerciseMinutes || 0), // uint16
        Number(sleepHours || 0), // uint8
        // Input proof
        encrypted.inputProof     // bytes
      ];

      console.log('📋 Contract args prepared:', {
        encryptedHandles: encrypted.handles.length,
        age: Number(age || 0),
        exerciseMinutes: Number(exerciseMinutes || 0),
        sleepHours: Number(sleepHours || 0),
        inputProofSize: encrypted.inputProof.length
      });

      shareData(
        {
          address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
          abi: CEREBRUM_ABI,
          functionName: 'shareHealthData',
          args,
          gas: 10000000n, // Set gas limit under network cap (16,777,216)
        } as any,
        {
          onSuccess: (hash) => {
            console.debug('Share data transaction hash:', hash);
            toast.success('Health data shared! Transaction submitted.');
          },
          onError: (err: any) => {
            console.error('shareData error:', err);
            toast.error(err?.shortMessage || err?.message || 'Failed to share health data');
          }
        }
      );
    } catch (error) {
      console.error('❌ Error encrypting health data:', error);
      toast.error('Failed to encrypt health data. Please try again.');
    }
  };

  const handleToggleSharing = () => {
    console.debug('handleToggleSharing called', {
      sharingEnabled,
      toggleSharing: !!toggleSharing,
      address,
      isConnected,
      contractAddress: CEREBRUM_CONTRACT_ADDRESS
    });

    if (!toggleSharing) {
      toast.error('Write function not available. Make sure your wallet is connected.');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    console.debug('Calling toggleDataSharing (no args - contract toggles internally)');
    
    toggleSharing(
      {
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'toggleDataSharing',
        gas: 3000000n, // Set gas limit under network cap
      } as any,
      {
        onSuccess: (hash) => {
          console.debug('Transaction hash received:', hash);
          toast.success('Transaction submitted! Waiting for confirmation...');
        },
        onError: (err: any) => {
          console.error('toggleSharing error:', err);
          console.error('Error details:', {
            message: err?.message,
            cause: err?.cause,
            code: err?.code,
            details: err?.details
          });
          toast.error(err?.shortMessage || err?.message || 'Transaction failed');
        }
      }
    );
  };

  // Lender approval handler
  const handleApproveLender = async (lenderAddr: string) => {
    if (!isAddress(lenderAddr)) {
      toast.error('Invalid lender address');
      return;
    }
    
    // Check if already approved
    if (approvedLenders.some(l => l.address.toLowerCase() === lenderAddr.toLowerCase())) {
      toast.error('This lender is already approved!');
      return;
    }
    
    try {
      await approveLender({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'approveLender',
        args: [lenderAddr],
        gas: 3000000n, // Set gas limit under network cap
      } as any);
      toast.success('Lender approval submitted!');
    } catch (error: any) {
      console.error('Approve lender error:', error);
      toast.error(error?.message || 'Failed to approve lender');
    }
  };

  // Revoke lender access (prevents future eligibility checks)
  const handleRevokeLender = async (lenderAddr: string) => {
    if (!isAddress(lenderAddr)) {
      toast.error('Invalid lender address');
      return;
    }
    try {
      await revokeLenderAccess({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'revokeLender',
        args: [lenderAddr],
        gas: 3000000n,
      } as any);
      toast.success('Lender revocation submitted!');
    } catch (error: any) {
      console.error('Revoke lender error:', error);
      toast.error(error?.message || 'Failed to revoke lender');
    }
  };

  // Enable instant decrypt (one-time permission grant)
  const handleEnableInstantDecrypt = () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    enableInstantDecrypt({
      address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
      abi: CEREBRUM_ABI,
      functionName: 'enableInstantDecrypt',
      gas: 3000000n, // Set gas limit under network cap
    } as any);
  };

  // INSTANT DECRYPT - Using Zama Gateway Infrastructure ⚡
  // Your contract is on Sepolia (host chain)
  // Zama handles the Gateway chain (55815) automatically via Relayer
  const handleInstantDecrypt = async () => {
    if (!address || !walletClient) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!healthScoreHandle) {
      toast.error('No encrypted score found. Share health data first!');
      return;
    }

    // In v0.9, user decryption is handled directly by RelayerSDK
    // No need to check for instant decrypt permission

    try {
      console.log('🔓 Starting user decryption with RelayerSDK...');
      
      // Convert handle to hex string (v0.9 format)
      let handleHex = healthScoreHandle as string;
      if (!handleHex.startsWith('0x')) {
        // If it's a bigint, convert to hex
        const handleBigInt = BigInt(healthScoreHandle as any);
        handleHex = '0x' + handleBigInt.toString(16).padStart(64, '0');
      }
      
      toast.loading('⚡ Decrypting instantly (2-5s)...', { id: 'decrypt' });
      console.log('   Handle:', handleHex);
      console.log('   Contract:', CEREBRUM_CONTRACT_ADDRESS);
      console.log('   User:', address);
      
      // Decrypt using hook - uses Zama's infrastructure
      // This will:
      // 1. Sign EIP-712 message for permission
      // 2. Zama's relayer forwards to Gateway chain
      // 3. KMS nodes process and sign
      // 4. Returns decrypted value in 2-5 seconds!
      const decrypted = await decryptScore(
        handleHex,
        CEREBRUM_CONTRACT_ADDRESS as string,
        address,
        walletClient
      );

      toast.dismiss('decrypt');
      toast.success('🎉 Score decrypted in 2-5 seconds!');
      
      console.log('✅ Instant decrypt successful:', decrypted);
      setDecryptedScore(Number(decrypted));
      setInstantDecryptedScore(Number(decrypted));
      triggerConfetti();
      
    } catch (error: any) {
      toast.dismiss('init-fhe');
      toast.dismiss('decrypt');
      
      console.error('❌ Instant decryption failed:', error);
      
      // Provide helpful error messages
      if (error?.message?.includes('not authorized') || error?.message?.includes('permission')) {
        toast.error(
          '🔒 Permission not granted. Try enabling instant decrypt again or use Gateway Decrypt.',
          { duration: 6000 }
        );
      } else if (error?.message?.includes('gateway') || error?.message?.includes('relayer')) {
        toast.error(
          '⚠️ Zama gateway temporarily unavailable. Please try again or use "Gateway Decrypt".',
          { duration: 5000 }
        );
      } else if (error?.message?.includes('wallet')) {
        toast.error('Please connect your Web3 wallet');
      } else {
        toast.error(
          'Instant decrypt failed. Using "Gateway Decrypt (30-60s)" as fallback is recommended.',
          { duration: 5000 }
        );
      }
    }
  };

  const handleClaimEarnings = () => {
    claimEarnings({
      address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
      abi: CEREBRUM_ABI,
      functionName: 'claimEarnings',
      gas: 3000000n, // Set gas limit under network cap
    } as any);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 border border-emerald-500/20 rounded-3xl p-12 text-center max-w-md backdrop-blur-xl"
        >
          <Lock className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to access the Patient Dashboard</p>
        </motion.div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 border border-emerald-500/20 rounded-3xl p-12 text-center max-w-md backdrop-blur-xl"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <Users className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-4 text-white">Register as Patient</h2>
          <p className="text-gray-400 mb-8">
            Start your journey to building your encrypted health credit score
          </p>
          <motion.button
            onClick={handleRegister}
            disabled={isRegistering || isRegisteringPending}
            whileHover={!(isRegistering || isRegisteringPending) ? { 
              scale: 1.1,
              y: -8,
              boxShadow: '0 20px 60px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.6)',
              transition: { duration: 0.3 }
            } : {}}
            whileTap={!(isRegistering || isRegisteringPending) ? { 
              scale: 0.95,
              y: 0,
              transition: { duration: 0.1 }
            } : {}}
            animate={!(isRegistering || isRegisteringPending) ? {
              y: [0, -3, 0],
              boxShadow: [
                '0 10px 40px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
                '0 15px 60px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.5)',
                '0 10px 40px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
              ]
            } : {}}
            transition={{
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              },
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="relative w-full px-8 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl overflow-hidden hover:from-emerald-400 hover:via-green-400 hover:to-emerald-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {/* Animated gradient overlay */}
            {!(isRegistering || isRegisteringPending) && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-200%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 0.5
                }}
              />
            )}
            <span className="relative z-10">
              {(isRegistering || isRegisteringPending) ? (
                <>
                  <motion.div
                    className="inline-block"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader className="w-5 h-5" />
                  </motion.div>
                  <span className="ml-2">Registering...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl mr-2">🚀</span>
                  Register Now
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Transaction Modals */}
  <TransactionModal show={isRegistering || isRegisteringPending} txHash={registerHash} title="Registering Patient..." />
  <TransactionModal show={isSharing || isSharingPending} txHash={shareHash} title="Sharing Health Data..." />
  <TransactionModal show={isToggling || isTogglingPending} txHash={toggleHash} title="Updating Preferences..." />
  <TransactionModal show={isApprovingLender || isApprovingLenderTx || isApproving} txHash={approveLenderHash} title="Approving Lender Access" />
  <TransactionModal show={isRevokingLender || isRevokingLenderTx} txHash={revokeLenderHash} title="Revoking Lender Access" />
  <TransactionModal show={isClaiming || isClaimingPending} txHash={claimHash} title="Claiming Earnings..." />
  <TransactionModal show={isEnablingInstantDecrypt} txHash={enableInstantHash} title="Enabling User Decrypt..." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Workflow Guide */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Patient Dashboard
          </h1>
          <p className="text-gray-400 text-lg mb-6">Manage your encrypted health data and earnings</p>

          {/* How It Works - Mini Workflow Guide */}
          <div className="mt-8 flex justify-center items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">1</div>
              <span>Share Health Data</span>
            </div>
            <div className="text-emerald-500">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">2</div>
              <span>Build Credit Score</span>
            </div>
            <div className="text-emerald-500">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">3</div>
              <span>Earn Rewards</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/5 border border-emerald-500/20 rounded-2xl p-4 mb-8 backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-white">Quick Stats</p>
                <p className="text-xs text-gray-400">
                  {dataShareCount} shares • {formatEther(totalEarnings)} ETH earned
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  refetchPatient();
                  // Removed refetchInstantDecryptStatus as it's not available in v0.9
                  toast.success('Dashboard refreshed!');
                }}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
              {totalEarnings > BigInt(0) && (
                <button
                  onClick={handleClaimEarnings}
                  disabled={isClaiming || isClaimingPending}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                >
                  <DollarSign className="w-4 h-4" />
                  Quick Claim
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Credit Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all hover:scale-105 duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-emerald-400" />
              {decryptedScore !== null ? (
                <Eye className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-yellow-400" />
              )}
            </div>
            <h3 className="text-sm text-gray-400 mb-2">Health Credit Score</h3>
            {decryptedScore !== null ? (
              <>
                <div className="text-4xl font-bold text-emerald-400 mb-1">
                  <AnimatedNumber value={decryptedScore} />
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 mb-2">
                  <Shield className="w-3 h-3" />
                  <span>User decrypted (EIP-712)</span>
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                🔒 Encrypted
              </div>
            )}
            <div className="space-y-3 mt-4">
              {/* User Decrypt (FHEVM v0.9+) */}
              <div>
                <p className="text-xs text-gray-500 mb-2 text-center">
                  ⚡ Client-Side Decrypt (0-2s via RelayerSDK)
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleInstantDecrypt}
                    disabled={isInstantDecrypting}
                    className="w-full text-sm px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30"
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Shield className="w-4 h-4" />
                      {isInstantDecrypting ? 'Decrypting...' : 'View Score'}
                    </div>
                  </button>
                    <p className="text-xs text-center text-gray-500">
                      💡 Tip: Re-enable after sharing new health data
                    </p>
                  </div>
              </div>
            </div>
          </motion.div>

          {/* Total Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all hover:scale-105 duration-300"
          >
            <DollarSign className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-sm text-gray-400 mb-2">Total Earnings</h3>
            <div className="text-4xl font-bold text-emerald-400 mb-2">
              {formatEther(totalEarnings)} ETH
            </div>
            <motion.button
              onClick={handleClaimEarnings}
              disabled={isClaiming || isClaimingPending || totalEarnings === BigInt(0)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isClaiming || isClaimingPending) ? 'Claiming...' : 'Claim Earnings'}
            </motion.button>
          </motion.div>

          {/* Data Shares */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all hover:scale-105 duration-300"
          >
            <Activity className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-sm text-gray-400 mb-2">Data Shares</h3>
            <div className="text-4xl font-bold text-emerald-400 mb-2">
              <AnimatedNumber value={dataShareCount} />
            </div>
            <div className="text-sm text-gray-500">
              Each share improves your health score
            </div>
          </motion.div>

          {/* Sharing Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all hover:scale-105 duration-300"
          >
            <TrendingUp className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-sm text-gray-400 mb-2">Sharing Status</h3>
            <div className={`text-2xl font-bold mb-2 ${sharingEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
              {sharingEnabled ? '✓ Enabled' : '✕ Disabled'}
            </div>
            <motion.button
              onClick={handleToggleSharing}
              disabled={isToggling || isTogglingPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                sharingEnabled 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' 
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
              } disabled:opacity-50`}
            >
              {(isToggling || isTogglingPending) ? 'Updating...' : sharingEnabled ? 'Disable' : 'Enable'}
            </motion.button>
          </motion.div>
        </div>

        {/* Share Health Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8 mb-8 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-bold">Share Health Data</h2>
                <p className="text-xs text-gray-400 mt-1">Earn +10 points per share</p>
              </div>
            </div>
            {!sharingEnabled && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-300">Sharing Disabled - Enable to earn rewards</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-300 font-semibold mb-1">Auto Re-encryption Active</p>
                  <p className="text-xs text-gray-400">
                    Your credit score will automatically re-encrypt after each data share for maximum privacy.
                    You'll need to decrypt again to view your updated score.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-300 font-semibold mb-1">Sharing Frequency</p>
                  <p className="text-xs text-gray-400">
                    📝 <strong>Note:</strong> In future updates, users will only be able to share health data once per week to prevent gaming the system and ensure data quality.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                Blood Sugar (mg/dL) *
              </label>
              <input
                type="number"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                placeholder="e.g., 120"
                className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Cholesterol (mg/dL) *
              </label>
              <input
                type="number"
                value={cholesterol}
                onChange={(e) => setCholesterol(e.target.value)}
                placeholder="e.g., 180"
                className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                BMI (kg/m²) *
              </label>
              <input
                type="number"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                placeholder="e.g., 24"
                className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Advanced Metrics Toggle */}
          <motion.button
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors mb-4 flex items-center gap-2"
          >
            {showAdvancedMetrics ? '− Hide' : '+ Show'} Advanced Metrics (Optional)
          </motion.button>

          {showAdvancedMetrics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 mb-6 border-t border-emerald-500/10 pt-6"
            >
              <p className="text-sm text-emerald-300 mb-4">
                📊 Add more health metrics for better credit score accuracy. Leave blank if you don't have the data.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Blood Pressure (Systolic)
                  </label>
                  <input
                    type="number"
                    value={bloodPressureSystolic}
                    onChange={(e) => setBloodPressureSystolic(e.target.value)}
                    placeholder="e.g., 120"
                    className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Blood Pressure (Diastolic)
                  </label>
                  <input
                    type="number"
                    value={bloodPressureDiastolic}
                    onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                    placeholder="e.g., 80"
                    className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="e.g., 72"
                    className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 70"
                    className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g., 175"
                    className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 30"
                    className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    Exercise (min/week)
                  </label>
                  <input
                    type="number"
                    value={exerciseMinutes}
                    onChange={(e) => setExerciseMinutes(e.target.value)}
                    placeholder="e.g., 150"
                    className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Sleep (hours/night)
                  </label>
                  <input
                    type="number"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    placeholder="e.g., 7"
                    className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            onClick={handleShareData}
            disabled={!isRegistered || isSharing || isSharingPending || !sharingEnabled}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isRegistered 
              ? 'Register First to Share Data' 
              : (isSharing || isSharingPending) 
                ? 'Sharing Data...' 
                : 'Share Health Data (+10 Points)'}
          </motion.button>
        </motion.div>

        {/* Activity Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-6"
        >
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Activity History
          </h2>
          <p className="text-gray-400">Track your transactions and health data contributions</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Last 3 Transactions (Any Activity) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold">Recent Transactions</h3>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
                Last 3
              </span>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx: any, i: number) => (
                  <div key={i} className="bg-black/50 border border-emerald-500/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-emerald-400">{tx.action}</span>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(Number(tx.timestamp) * 1000).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </motion.div>

          {/* Last 3 Health Data Shares */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold">Health Data Shares</h3>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
                Last 3
              </span>
            </div>

            {healthDataTransactions.length > 0 ? (
              <div className="space-y-3">
                {healthDataTransactions.map((tx: any, i: number) => (
                  <div key={i} className="bg-black/50 border border-emerald-500/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-emerald-400">
                        Data Share #{dataShareCount - i}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                          +10 points
                        </span>
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(Number(tx.timestamp) * 1000).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Droplet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No health data shared yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Approve Lender Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold">Approve Lender Access</h3>
              <p className="text-xs text-gray-400 mt-1">Control who can check your eligibility</p>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <p className="text-sm text-gray-400">
              Grant specific lenders permission to check your health score eligibility (encrypted comparison only)
            </p>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-xs text-emerald-300">
                💡 <strong>Tip:</strong> You can approve yourself as a lender to test the eligibility check feature from the Lender Portal!
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={lenderAddress}
              onChange={(e) => setLenderAddress(e.target.value)}
              placeholder="0x... (Lender Address or Your Address)"
              className="flex-1 px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            <motion.button
              onClick={() => handleApproveLender(lenderAddress)}
              disabled={!lenderAddress || isApprovingLender || isApprovingLenderTx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isApprovingLender || isApprovingLenderTx) ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Approve
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Manage Approved Lenders Section */}
        {isRegistered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-xl font-bold">Manage Approved Lenders</h3>
                <p className="text-xs text-gray-400 mt-1">View and revoke lender access permissions</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Info Box */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-amber-300 font-semibold mb-1">🔒 Privacy Protection</p>
                    <p className="text-amber-200/80 text-xs leading-relaxed">
                      Lenders can only decrypt <strong>TRUE/FALSE eligibility results</strong>, never your actual health score. 
                      Revoking access prevents future eligibility checks but doesn't invalidate past results.
                    </p>
                    <p className="text-amber-200/80 text-xs mt-2">
                      💡 <strong>Tip:</strong> To fully invalidate old results, share new health data after revoking. 
                      This creates new encrypted handles, making all previous eligibility checks obsolete.
                    </p>
                  </div>
                </div>
              </div>

              {/* Approved Lenders List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {loadingLenders ? (
                      <span className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Loading approved lenders...
                      </span>
                    ) : (
                      <>{approvedLenders.length} approved lender(s)</>
                    )}
                  </p>
                </div>
                
                {approvedLenders.length > 0 ? (
                  <>
                  {approvedLenders
                    .map((lender, idx) => {
                      const lenderAddr = lender.address;
                      const timestamp = lender.timestamp;
                      const isYourself = lenderAddr.toLowerCase() === address?.toLowerCase();

                      return (
                        <motion.div
                          key={`${lenderAddr}-${idx}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white/5 border border-emerald-500/20 rounded-xl p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <p className="text-sm font-mono text-white truncate">
                                  {lenderAddr}
                                </p>
                                {isYourself && (
                                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                Approved: {new Date(timestamp * 1000).toLocaleString()}
                              </p>
                            </div>
                            
                            <motion.button
                              onClick={() => handleRevokeLender(lenderAddr)}
                              disabled={isRevokingLender || isRevokingLenderTx}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/20"
                            >
                              {(isRevokingLender || isRevokingLenderTx) ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  Revoking...
                                </>
                              ) : (
                                <>
                                  <UserX className="w-4 h-4" />
                                  Revoke
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                    </>
                  ) : (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No approved lenders yet</p>
                  <p className="text-gray-500 text-sm mt-1">Use the form above to approve your first lender</p>
                </div>
                )}
              </div>

              {/* Data Refresh Reminder */}
              {approvedLenders.length > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-emerald-300 font-semibold mb-1">Complete Revocation</p>
                      <p className="text-emerald-200/80 text-xs leading-relaxed">
                        After revoking a lender, share new health data to fully invalidate all their old eligibility check results. 
                        This creates fresh encrypted handles that they can't decrypt.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
