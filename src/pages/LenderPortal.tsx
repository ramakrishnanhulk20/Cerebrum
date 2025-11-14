import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  Lock, 
  DollarSign, 
  Activity,
  AlertCircle,
  Gauge,
  Sliders,
  Loader,
  ExternalLink,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts-v09';
import { isAddress, parseEther } from 'viem';
import { useLenderFhevm } from '../hooks/useFhevmV09';

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
  );
};

const LenderPortal = () => {
  const { address, isConnected } = useAccount();
  const [minCreditScore, setMinCreditScore] = useState(650);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showCheckingModal, setShowCheckingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'checked'>('all');
  const [eligibilityResult, setEligibilityResult] = useState<{
    address: string;
    meetsRequirement: boolean;
    timestamp: number;
  } | null>(null);
  const [lastCheckedThreshold, setLastCheckedThreshold] = useState<number | null>(null);

  // v0.9 FHEVM Client-Side Decryption
  const { encryptThreshold, decryptEligibilityResult } = useLenderFhevm(CEREBRUM_CONTRACT_ADDRESS);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecryptingResult, setIsDecryptingResult] = useState(false);

  // Read total patients
  const { data: totalPatients } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getTotalPatients',
  });

  // Get all patient addresses to filter approved ones
  const { data: patientList } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientList',
  });

  // Get approved patients for this lender
  const { data: approvedPatientsList, refetch: refetchApprovedList } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getApprovedPatients',
    args: address ? [address] : undefined,
  });

  // For selected patient
  const { data: patientInfo, refetch: refetchPatient } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientInfo',
    args: selectedPatient ? [selectedPatient as `0x${string}`] : undefined,
  });

  const { data: hasApproval, refetch: refetchApproval } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'hasLenderApproval',
    args: selectedPatient && address ? [selectedPatient as `0x${string}`, address] : undefined,
  });

  // Write functions for eligibility check
  // Write functions (v0.9 - only check eligibility, decrypt is client-side!)
  // Write functions (v0.9 - check eligibility and grant permission for decrypt)
  const { writeContract: checkEligibility, data: checkHash } = useWriteContract();
  const { writeContract: grantEligibilityPermission, data: grantPermissionHash } = useWriteContract();

  const { isLoading: isChecking, isSuccess: checkSuccess, data: checkReceipt } = useWaitForTransactionReceipt({ hash: checkHash });
  const { isSuccess: isPermissionGranted, data: permissionReceipt } = useWaitForTransactionReceipt({ hash: grantPermissionHash });

  // Read eligibility history
  const { data: eligibilityHistory, refetch: refetchEligibility } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getEligibilityHistory',
    args: selectedPatient && address ? [selectedPatient as `0x${string}`, address] : undefined,
  });

  // Track if check was completed for current patient (to show decrypt button)
  const [checkCompletedForPatient, setCheckCompletedForPatient] = useState<string | null>(null);

  // Debug: Check if patient has encrypted health score
  const { data: patientHealthScore } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getEncryptedHealthScore',
    args: selectedPatient ? [selectedPatient as `0x${string}`] : undefined,
  });

  // Log health score for debugging
  useEffect(() => {
    if (selectedPatient && patientHealthScore) {
      console.log('🏥 [LenderPortal] Patient health score handle:', patientHealthScore);
      console.log('📊 [LenderPortal] Is health score zero?:', 
        patientHealthScore === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
        BigInt(patientHealthScore as any) === 0n
      );
    }
  }, [selectedPatient, patientHealthScore]);

  const isRegistered = patientInfo?.[0] as boolean;
  const sharingEnabled = patientInfo?.[1] as boolean;
  const dataShareCount = patientInfo?.[4] ? Number(patientInfo[4]) : 0;

  // Get risk level based on score (if decrypted)
  const getRiskLevel = (score: number) => {
    if (score < 550) return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    if (score < 650) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    return { level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  };

  const riskInfo = null; // v0.9: Lenders only see eligibility yes/no, not the actual score

  const handleSearch = () => {
    if (!isAddress(searchAddress)) {
      toast.error('Invalid patient address');
      return;
    }

    setSelectedPatient(searchAddress);
    setEligibilityResult(null);
    refetchPatient();
    refetchApproval();
    toast.success('Patient lookup successful!');
  };

  // v0.9: Check eligibility with encrypted threshold
  const handleCheckEligibility = async () => {
    if (!selectedPatient) {
      toast.error('Please search for a patient first');
      return;
    }

    if (!hasApproval) {
      toast.error('Patient has not approved you as a lender');
      return;
    }

    console.log('🔍 [LenderPortal] Pre-check validation:');
    console.log('   Patient address:', selectedPatient);
    console.log('   Lender address:', address);
    console.log('   Patient health score handle:', patientHealthScore);
    console.log('   Minimum credit score threshold (current):', minCreditScore);
    console.log('   Last checked threshold:', lastCheckedThreshold);
    console.log('   Is patient registered?:', isRegistered);
    console.log('   Data share count:', dataShareCount);

    // Reset previous results so user clearly sees the new check
    setEligibilityResult(null);
    setLastCheckedThreshold(minCreditScore);
    setShowCheckingModal(true);
    setIsEncrypting(true);

    try {
      console.log('🔐 [LenderPortal] Encrypting threshold:', minCreditScore);
      
      // Step 1: Encrypt the minimum score threshold
      const encrypted = await encryptThreshold(minCreditScore);
      console.log('✅ [LenderPortal] Threshold encrypted successfully');
      
      setIsEncrypting(false);

      // Step 2: Call contract with encrypted threshold
      checkEligibility(
        {
          address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
          abi: CEREBRUM_ABI,
          functionName: 'checkEligibilityWithEncryptedThreshold',
          args: [
            selectedPatient as `0x${string}`,
            encrypted.handle,
            encrypted.inputProof,
          ],
          value: parseEther('0.01'),
          gas: 8000000n, // Increased gas limit for FHE operations
        } as any,
        {
          onSuccess: (hash) => {
            console.log('✅ Eligibility check transaction submitted:', hash);
            toast.success('Transaction submitted! Waiting for confirmation...');
          },
          onError: (error: any) => {
            setShowCheckingModal(false);
            console.error('❌ Eligibility check error:', error);
            toast.error(error?.shortMessage || error?.message || 'Transaction failed');
          },
        }
      );
    } catch (error: any) {
      console.error('❌ Failed to encrypt threshold:', error);
      setIsEncrypting(false);
      setShowCheckingModal(false);
      toast.error('Failed to encrypt threshold');
    }
  };

  // v0.9: After check succeeds, close modal and show decrypt button
  useEffect(() => {
    if (checkSuccess && checkReceipt && selectedPatient) {
      setShowCheckingModal(false);
      console.log('✅ [LenderPortal] Eligibility check transaction confirmed!');
      
      // Mark check as completed for this patient
      setCheckCompletedForPatient(selectedPatient);
      
      toast.success('✅ Check complete! Click "Decrypt Result" to view eligibility.', { duration: 5000 });
    }
  }, [checkSuccess, checkReceipt, selectedPatient]);

  // v0.9: Client-side decryption of eligibility result
  const handleDecryptEligibility = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient first');
      return;
    }

    setIsDecryptingResult(true);
    try {
      console.log('🔬 [LenderPortal] Starting eligibility decryption...');
      console.log('📝 Step 1: Calling getEncryptedEligibilityResult to grant FHE.allow() permissions...');
      
      // Step 1: Call getEncryptedEligibilityResult as transaction to grant permanent FHE.allow() permissions
      grantEligibilityPermission({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'getEncryptedEligibilityResult',
        args: [selectedPatient as `0x${string}`],
      } as any);

      // Step 2: After permission granted, decrypt (handled in useEffect below)
    } catch (error: any) {
      console.error('❌ [LenderPortal] Failed to start eligibility decryption:', error);
      toast.error('Failed to start decryption');
      setIsDecryptingResult(false);
    }
  };

  // Handle permission granted -> decrypt
  useEffect(() => {
    if (!isPermissionGranted || !permissionReceipt || !selectedPatient) return;

    const performEligibilityDecrypt = async () => {
      try {
        console.log('✅ [LenderPortal] Permission granted! Parsing event for encrypted handle...');
        
        // Parse EligibilityPermissionGranted event from permission transaction
        const eligibilityEvent = permissionReceipt.logs.find((log: any) => {
          return log.address?.toLowerCase() === CEREBRUM_CONTRACT_ADDRESS.toLowerCase() && 
                 log.topics[0] === '0x5f43d7159a4a7fac7040467743e8e2f1d43ee245d0de4d42977b657e7d37fc39';
        });
        
        if (!eligibilityEvent) {
          toast.error('Event not found in transaction receipt');
          setIsDecryptingResult(false);
          return;
        }

        // Parse the data field (bytes32 resultHandle + uint256 timestamp)
        const { data } = eligibilityEvent;
        const hexData = data.slice(2); // Remove 0x prefix
        const resultHandle = '0x' + hexData.slice(0, 64); // First 32 bytes (64 hex chars)

        console.log('🔓 [LenderPortal] Decrypting eligibility result...');
        console.log('🔑 [LenderPortal] Encrypted result handle:', resultHandle);
        
        const isEligible = await decryptEligibilityResult(resultHandle);
        
        setEligibilityResult({
          address: selectedPatient!,
          meetsRequirement: isEligible,
          timestamp: Date.now() / 1000,
        });

        console.log('✅ [LenderPortal] Eligibility result:', isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE');
        
        if (isEligible) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        
        toast.success('✅ Eligibility result decrypted!');
      } catch (error: any) {
        console.error('❌ [LenderPortal] Failed to decrypt result:', error);
        toast.error('Failed to decrypt eligibility result');
      } finally {
        setIsDecryptingResult(false);
      }
    };

    performEligibilityDecrypt();
  }, [isPermissionGranted, permissionReceipt, selectedPatient, decryptEligibilityResult]);

  // Filter approved patients (this would need on-chain data in real implementation)
  // For now, we'll show patients that have approved this lender
  const approvedPatients = patientList as `0x${string}`[] || [];

  // Filter patients based on search and active tab
  const filteredPatients = useMemo(() => {
    let filtered = (patientList as `0x${string}`[]) || [];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tab filter
    if (activeTab === 'approved' && approvedPatientsList) {
      const approved = approvedPatientsList as `0x${string}`[];
      filtered = filtered.filter(p => approved.includes(p));
    } else if (activeTab === 'checked') {
      // Show patients you've checked before (would need tracking in real implementation)
      // For now, just show approved ones
      const approved = approvedPatientsList as `0x${string}`[];
      filtered = approved ? filtered.filter(p => approved.includes(p)) : [];
    }

    return filtered.slice(0, 20); // Limit to 20
  }, [patientList, searchQuery, activeTab, approvedPatientsList]);

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
          <p className="text-gray-400">Please connect your wallet to access the Lender Portal</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Transaction Progress Modal (v0.9 - only shows during check, decrypt is instant!) */}
      <TransactionModal 
        show={showCheckingModal && (isEncrypting || isChecking)} 
        txHash={checkHash} 
        title={isEncrypting ? "Encrypting Threshold..." : "Checking Eligibility"} 
      />

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section with Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Lender Dashboard
          </h1>
          <p className="text-gray-400 text-lg mb-6">Check encrypted health creditworthiness without seeing patient scores</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient by address (0x...)"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-emerald-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* How It Works - Mini Guide */}
          <div className="mt-8 flex justify-center items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">1</div>
              <span>Set Criteria</span>
            </div>
            <div className="text-emerald-500">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">2</div>
              <span>Find Patient</span>
            </div>
            <div className="text-emerald-500">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">3</div>
              <span>Check Eligibility</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <Users className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-sm text-gray-400 mb-2">Total Patients</h3>
            <div className="text-4xl font-bold text-emerald-400">
              <AnimatedNumber value={totalPatients ? Number(totalPatients) : 0} />
            </div>
          </div>

          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <DollarSign className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-sm text-gray-400 mb-2">Check Fee</h3>
            <div className="text-4xl font-bold text-emerald-400">0.01</div>
            <p className="text-xs text-gray-500 mt-1">ETH per eligibility check</p>
          </div>

          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <Shield className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-sm text-gray-400 mb-2">Privacy Level</h3>
            <div className="text-4xl font-bold text-emerald-400">100%</div>
            <p className="text-xs text-gray-500 mt-1">Encrypted comparisons only</p>
          </div>
        </motion.div>

        {/* Patient Discovery - Tabbed Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8 mb-8 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-400" />
              <h2 className="text-2xl font-bold">Patient Discovery</h2>
            </div>
            <button
              onClick={() => {
                refetchPatient();
                refetchApprovedList();
                toast.success('Data refreshed!');
              }}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-emerald-500/20">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'all'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                All Patients ({patientList ? (patientList as any[]).length : 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'approved'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approved Me ({approvedPatientsList ? (approvedPatientsList as any[]).length : 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('checked')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'checked'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Previously Checked
              </div>
            </button>
          </div>

          {/* Tab Description */}
          <p className="text-sm text-gray-400 mb-6">
            {activeTab === 'all' && 'Browse all registered patients in the system. Look for those who approved you as a lender.'}
            {activeTab === 'approved' && 'Patients who have granted you permission to check their eligibility. You can run checks on these patients.'}
            {activeTab === 'checked' && 'Patients you have previously run eligibility checks on.'}
          </p>

          {/* Patient List */}
          <div className="space-y-3">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patientAddr, index) => (
                <PatientCard
                  key={patientAddr}
                  address={patientAddr}
                  isApproved={(approvedPatientsList as `0x${string}`[] || []).includes(patientAddr)}
                  isSelected={selectedPatient === patientAddr}
                  onSelect={() => {
                    setSearchAddress(patientAddr);
                    setSelectedPatient(patientAddr);
                    refetchPatient();
                    refetchApproval();
                    toast.success('Patient selected!');
                    document.getElementById('patient-info-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  showApprovalBadge={activeTab === 'approved'}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>
                  {searchQuery 
                    ? 'No patients found matching your search' 
                    : activeTab === 'approved'
                    ? 'No patients have approved you yet'
                    : 'No patients available'}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Credit Score Criteria Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8 mb-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sliders className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl font-bold">Set Your Credit Score Criteria</h2>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            Define the minimum health credit score required for loan eligibility. Patients will be checked against this threshold using encrypted comparison.
          </p>

          <div className="bg-black/50 border border-emerald-500/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Minimum Score Required:</span>
              <div className="text-4xl font-bold text-emerald-400">
                {minCreditScore}
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="500"
              max="850"
              step="50"
              value={minCreditScore}
              onChange={(e) => setMinCreditScore(Number(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/50"
            />

            {/* Score Markers */}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>500 (Min)</span>
              <span>650 (Good)</span>
              <span>850 (Max)</span>
            </div>

            {/* Risk Level Indicator */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${minCreditScore < 600 ? 'bg-red-500/20 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="text-xs text-gray-400 mb-1">High Risk</div>
                <div className="text-sm font-semibold text-red-400">500-599</div>
              </div>
              <div className={`p-3 rounded-lg border ${minCreditScore >= 600 && minCreditScore < 700 ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="text-xs text-gray-400 mb-1">Medium Risk</div>
                <div className="text-sm font-semibold text-yellow-400">600-699</div>
              </div>
              <div className={`p-3 rounded-lg border ${minCreditScore >= 700 ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="text-xs text-gray-400 mb-1">Low Risk</div>
                <div className="text-sm font-semibold text-emerald-400">700-850</div>
              </div>
            </div>
          </div>
        </motion.div>



        {/* Selected Patient Details */}
        {selectedPatient && isRegistered && (
          <motion.div
            id="patient-info-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Patient: {selectedPatient.slice(0, 6)}...{selectedPatient.slice(-4)}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`flex items-center gap-2 ${hasApproval ? 'text-emerald-400' : 'text-red-400'}`}>
                    {hasApproval ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {hasApproval ? 'You are Approved' : 'Not Approved'}
                  </span>
                  <span className="text-gray-400">
                    {dataShareCount} data shares
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-gray-500" />
                <span className="text-sm text-gray-500">Encrypted</span>
              </div>
            </div>

            {!hasApproval && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 font-semibold mb-1">Not Approved</p>
                    <p className="text-sm text-gray-400">
                      This patient has not approved you as a lender. Please request approval from the patient first.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasApproval && (
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/50 border border-emerald-500/10 rounded-xl p-4">
                    <Activity className="w-6 h-6 text-emerald-400 mb-2" />
                    <div className="text-sm text-gray-400 mb-1">Data Shares</div>
                    <div className="text-2xl font-bold text-white">{dataShareCount}</div>
                  </div>

                  <div className="bg-black/50 border border-emerald-500/10 rounded-xl p-4">
                    <Shield className="w-6 h-6 text-emerald-400 mb-2" />
                    <div className="text-sm text-gray-400 mb-1">Health Score</div>
                    <div className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Encrypted
                    </div>
                  </div>

                  <div className="bg-black/50 border border-emerald-500/10 rounded-xl p-4">
                    <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
                    <div className="text-sm text-gray-400 mb-1">Sharing Status</div>
                    <div className={`text-lg font-bold ${sharingEnabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {sharingEnabled ? '✓ Enabled' : '✕ Disabled'}
                    </div>
                  </div>
                </div>

                {/* Check Eligibility */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-4 text-emerald-400">Eligibility Check</h4>
                  
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Your Minimum Requirement:</p>
                        <p className="text-3xl font-bold text-emerald-400">{minCreditScore}</p>
                        {lastCheckedThreshold !== null && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last checked threshold: {lastCheckedThreshold}
                          </p>
                        )}
                      </div>
                      <Gauge className="w-12 h-12 text-emerald-400 opacity-50" />
                    </div>
                  </div>

                  <button
                    onClick={handleCheckEligibility}
                    disabled={!selectedPatient || !hasApproval || isEncrypting || isChecking}
                    className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEncrypting ? 'Encrypting...' : isChecking ? 'Checking...' : 'Check Eligibility (Pay 0.01 ETH)'}
                  </button>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    ✨ v0.9: Privacy-preserving eligibility check with client-side decryption
                  </p>

                  {/* v0.9: Client-side decrypt button (if check completed) */}
                  {checkCompletedForPatient === selectedPatient && !eligibilityResult && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/20">
                      <button
                        onClick={handleDecryptEligibility}
                        disabled={isDecryptingResult}
                        className="w-full px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-medium rounded-lg border border-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isDecryptingResult ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Decrypting... (0-2s)
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Decrypt Result (Client-Side)
                          </>
                        )}
                      </button>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        ⚡ Instant decryption via EIP-712 signature
                      </p>
                    </div>
                  )}
                </div>

                {/* Eligibility Result Display */}
                {eligibilityResult && (
                  <div className={`border rounded-xl p-6 mt-6 ${
                    eligibilityResult.meetsRequirement 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-4">
                      {eligibilityResult.meetsRequirement ? (
                        <CheckCircle className="w-12 h-12 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-12 h-12 text-red-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-xl font-bold ${
                            eligibilityResult.meetsRequirement ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {eligibilityResult.meetsRequirement ? '✓ Meets Requirements' : '✕ Does Not Meet Requirements'}
                          </h4>
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                            Client-Side Decrypt (v0.9)
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Patient's encrypted score {eligibilityResult.meetsRequirement ? '≥' : '<'} {minCreditScore}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          ✅ Decrypted via EIP-712 signature (instant, 0-2s)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legacy Eligibility Result Display (remove duplicate) */}
                {false && eligibilityResult && (
                  <div className={`border rounded-xl p-6 mt-6 ${
                    eligibilityResult.meetsRequirement 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-4">
                      {eligibilityResult.meetsRequirement ? (
                        <CheckCircle className="w-12 h-12 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-12 h-12 text-red-400 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className={`text-xl font-bold mb-1 ${
                          eligibilityResult.meetsRequirement ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {eligibilityResult.meetsRequirement ? '✓ Meets Requirements' : '✕ Does Not Meet Requirements'}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Patient's encrypted score {eligibilityResult.meetsRequirement ? '≥' : '<'} {minCreditScore}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Checked: {new Date(eligibilityResult.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eligibility History */}
                {eligibilityHistory && (eligibilityHistory as any[]).length > 0 && (
                  <div className="bg-black/50 border border-emerald-500/10 rounded-xl p-6 mt-6">
                    <h4 className="text-lg font-semibold mb-4 text-white">Eligibility Check History</h4>
                    <div className="space-y-3">
                      {(eligibilityHistory as any[]).map((check, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                          <div className="flex items-center gap-3">
                            <Gauge className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-white">Min Score: {Number(check.minScore)}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(Number(check.timestamp) * 1000).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            Paid: {(Number(check.amountPaid) / 1e18).toFixed(4)} ETH
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {selectedPatient && !isRegistered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center"
          >
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Patient Not Registered</h3>
            <p className="text-gray-400">
              This address is not registered as a patient in the Cerebrum system.
            </p>
          </motion.div>
        )}

        {/* Privacy Protection Notice - Placed at the end for better visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mt-8"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Privacy Protection</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• You can <strong>NEVER</strong> see the patient's actual credit score</li>
                <li>• You can only check if they meet your minimum requirement (True/False)</li>
                <li>• Each eligibility check costs <strong>0.01 ETH</strong> (80% goes to patient)</li>
                <li>• Patient must approve you as a lender before you can check</li>
              </ul>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </>
  );
};

// Patient Card Component for Lender Portal
const PatientCard = ({
  address,
  isApproved,
  isSelected,
  onSelect,
  showApprovalBadge = false
}: {
  address: string;
  isApproved: boolean;
  isSelected: boolean;
  onSelect: () => void;
  showApprovalBadge?: boolean;
}) => {
  // Query patient info for each card
  const { data: patientInfo } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientInfo',
    args: [address as `0x${string}`],
  });

  const sharingEnabled = patientInfo?.[1] as boolean;
  const dataShareCount = patientInfo?.[4] ? Number(patientInfo[4]) : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-black/50 border rounded-xl p-6 transition-all cursor-pointer ${
        isSelected 
          ? 'border-emerald-500/50 bg-emerald-500/10' 
          : 'border-emerald-500/10 hover:border-emerald-500/30'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-mono text-white font-semibold">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              {showApprovalBadge && isApproved && (
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs text-emerald-400 font-semibold">
                  ✓ Approved
                </span>
              )}
              {!isApproved && (
                <span className="px-2 py-0.5 bg-gray-500/20 border border-gray-500/40 rounded-full text-xs text-gray-400 font-semibold">
                  Not Approved
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-emerald-400 flex items-center gap-1">
                <Activity className="w-4 h-4" />
                {dataShareCount} shares
              </span>
              <span className={sharingEnabled ? 'text-emerald-400' : 'text-gray-500'}>
                {sharingEnabled ? '✓ Sharing' : '✕ Not Sharing'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            isSelected
              ? 'bg-emerald-500/30 text-emerald-300'
              : 'bg-white/10 hover:bg-white/20 text-gray-300'
          }`}
        >
          {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    </motion.div>
  );
};

export default LenderPortal;
