import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { 
  Microscope, 
  Search, 
  Lock, 
  DollarSign, 
  Users, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  RefreshCw,
  TrendingUp,
  Heart,
  Activity,
  Droplet,
  ExternalLink,
  Loader,
  BarChart3,
  AlertTriangle,
  Eye,
  Zap,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts-v09';
import { formatEther, parseEther, isAddress } from 'viem';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { useResearcherFhevm } from '../hooks/useFhevmV09';

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

// No longer using simulated risks - using real FHE contract calculations

const ResearcherPortal = () => {
  const { address, isConnected } = useAccount();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [recordIndex, setRecordIndex] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'purchased' | 'recent'>('all');
  const [currentStep, setCurrentStep] = useState(1);

  // Decrypted data state (v0.9 client-side decryption)
  const [decryptedHealthData, setDecryptedHealthData] = useState<{
    bloodSugar: number;
    cholesterol: number;
    bmi: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    heartRate: number;
    weight: number;
    height: number;
  } | null>(null);
  
  const [decryptedRiskData, setDecryptedRiskData] = useState<{
    diabetesRisk: number;
    heartDiseaseRisk: number;
    strokeRisk: number;
  } | null>(null);

  const [isDecryptingHealth, setIsDecryptingHealth] = useState(false);
  const [isDecryptingRisks, setIsDecryptingRisks] = useState(false);

  // FHEVM v0.9 Client-Side Decryption
  const { decryptHealthRecord, decryptRiskScores } = useResearcherFhevm(CEREBRUM_CONTRACT_ADDRESS);

  // Read total patients
  const { data: totalPatients } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getTotalPatients',
  });

  // Read total data shares
  const { data: totalDataShares } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getTotalDataShares',
  });

  // Get count of patients actively sharing data
  const { data: sharingEnabledCount } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getSharingEnabledCount',
  });

  // Get all patient addresses
  const { data: patientList } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientList',
  });

  // Get researcher's purchased patients
  const { data: purchasedPatients, refetch: refetchPurchased } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getResearcherPurchasedPatients',
    args: address ? [address] : undefined,
  });

  // For selected patient
  const { data: patientInfo, refetch: refetchPatient } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientInfo',
    args: selectedPatient ? [selectedPatient as `0x${string}`] : undefined,
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds to detect new data shares
    }
  });

  // Query researcher's access round for this patient
  const { data: researcherAccessRound } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'researcherAccessRound',
    args: selectedPatient && address ? [selectedPatient as `0x${string}`, address] : undefined,
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds to check access status
    }
  });

  const { data: recordCount } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getHealthRecordCount',
    args: selectedPatient ? [selectedPatient as `0x${string}`] : undefined,
  });

  // Get encrypted health record (v0.9 - returns 8 euint64 handles)
  const { data: encryptedRecord, refetch: refetchHealthRecord } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getEncryptedHealthRecord' as any,
    args: selectedPatient && address ? [
      selectedPatient as `0x${string}`, 
      BigInt(recordIndex)
    ] : undefined,
  });

  // Get encrypted risk scores (v0.9 - returns 3 euint64 handles)
  const { data: encryptedRisks, refetch: refetchRiskScores } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getEncryptedRiskScores' as any,
    args: selectedPatient && address ? [
      selectedPatient as `0x${string}`, 
      BigInt(recordIndex)
    ] : undefined,
  });

  // Get dynamic access price based on data quality
  const { data: accessPrice } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'calculateAccessPrice',
    args: selectedPatient ? [
      selectedPatient as `0x${string}`, 
      BigInt(recordIndex)
    ] : undefined,
  });

  // Write functions (v0.9 - only purchase access, no decrypt requests!)
  const { writeContract: purchaseAccess, data: purchaseHash } = useWriteContract();
  const { writeContract: grantPermissionForRisks, data: grantPermissionHash } = useWriteContract();
  const { writeContract: grantPermissionForHealth, data: grantHealthPermissionHash } = useWriteContract();

  const { isLoading: isPurchasing, isSuccess: purchaseSuccess } = useWaitForTransactionReceipt({ hash: purchaseHash });
  const { isSuccess: isPermissionGranted, isError: isPermissionError } = useWaitForTransactionReceipt({ hash: grantPermissionHash });
  const { isSuccess: isHealthPermissionGranted, data: healthPermissionReceipt } = useWaitForTransactionReceipt({ hash: grantHealthPermissionHash });

  // Transaction hash logging
  useEffect(() => {
    if (purchaseHash) {
      console.log('📝 Purchase transaction hash:', purchaseHash);
      toast.loading('Transaction submitted! Waiting for confirmation...', { id: 'purchase-tx' });
    }
  }, [purchaseHash]);

  useEffect(() => {
    if (grantHealthPermissionHash) {
      console.log('📝 Health permission transaction hash:', grantHealthPermissionHash);
      toast.loading('⏳ Granting permissions... Please wait for confirmation.', { id: 'health-permission' });
    }
  }, [grantHealthPermissionHash]);

  // Success handlers
  useEffect(() => {
    if (purchaseSuccess) {
      console.log('✅ Purchase successful!');
      toast.dismiss('purchase-tx');
      toast.success('✅ Access purchased successfully!');
      // Access will be recalculated automatically when researcherAccessRound refetches
      refetchPatient();
      refetchPurchased();
    }
  }, [purchaseSuccess]);

  // Handle permission grant success and decrypt
  useEffect(() => {
    if (isPermissionGranted && grantPermissionHash) {
      console.log('✅ Permission granted (FHE.allow)! Now reading encrypted handles...');
      toast.success('Permission granted! Reading encrypted data...');
      
      // After FHE.allow() is granted, we can read the encrypted handles
      setTimeout(async () => {
        try {
          console.log('� Reading contract with FHE.allow permission...');
          
          // Import viem to create a public client
          const { createPublicClient, http } = await import('viem');
          const { sepolia } = await import('viem/chains');
          
          // Create a public client to read contract (use public RPC)
          const publicClient = createPublicClient({
            chain: sepolia,
            transport: http('https://rpc.sepolia.org')
          });
          
          // Read the encrypted risk scores now that permission is granted
          const risks = await publicClient.readContract({
            address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
            abi: CEREBRUM_ABI,
            functionName: 'getEncryptedRiskScores',
            args: [selectedPatient as `0x${string}`, BigInt(recordIndex)],
          } as any);
          
          console.log('📊 [ResearcherPortal] Encrypted risks read from contract:', risks);
          
          if (!risks || !Array.isArray(risks) || risks.length !== 3) {
            throw new Error('Invalid encrypted risk data returned from contract');
          }

          const risksArray = risks as unknown as readonly [string, string, string];
          
          // Check if handles are valid (not all zeros)
          const allZeros = risksArray.every((r: string) => 
            r === '0x0000000000000000000000000000000000000000000000000000000000000000' || r === '0x0'
          );
          
          if (allZeros) {
            throw new Error('Encrypted handles are empty. Risk calculation may have failed.');
          }
          
          toast.loading('🔓 Decrypting risk scores...', { id: 'decrypt-risks' });
          
          const decrypted = await decryptRiskScores({
            diabetesRisk: risksArray[0],
            heartDiseaseRisk: risksArray[1],
            strokeRisk: risksArray[2],
          });

          toast.dismiss('decrypt-risks');
          setDecryptedRiskData(decrypted);
          toast.success('✅ Risk scores decrypted!');
          console.log('✅ [ResearcherPortal] Decrypted risk scores:', decrypted);
        } catch (error: any) {
          toast.dismiss('decrypt-risks');
          console.error('❌ Failed to decrypt after permission grant:', error);
          toast.error(error?.message || 'Failed to decrypt. Please try again.');
        } finally {
          setIsDecryptingRisks(false);
        }
      }, 3000); // 3 second delay to ensure permission transaction is fully mined
    }
  }, [isPermissionGranted, grantPermissionHash, selectedPatient, address, recordIndex, decryptRiskScores]);

  // Handle permission grant error
  useEffect(() => {
    if (isPermissionError) {
      toast.error('Failed to grant permission');
      setIsDecryptingRisks(false);
    }
  }, [isPermissionError]);

  // Build ranked patient list
  const rankedPatients = useMemo(() => {
    if (!patientList) return [];

    const patients = patientList as `0x${string}`[];
    
    // Get patient info for each and sort by data share count
    return patients
      .map(addr => ({
        address: addr,
        // We'll need to query each patient's info in real implementation
        // For now, using placeholder data
      }))
      .slice(0, 20); // Top 20
  }, [patientList]);

  // Filter patients based on search and active tab
  const filteredPatients = useMemo(() => {
    let filtered = rankedPatients;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tab filter
    if (activeTab === 'purchased' && purchasedPatients) {
      const purchased = purchasedPatients as `0x${string}`[];
      filtered = filtered.filter(p => purchased.includes(p.address));
    } else if (activeTab === 'recent') {
      // Show top 5 most recent (placeholder logic)
      filtered = filtered.slice(0, 5);
    }

    return filtered;
  }, [rankedPatients, searchQuery, activeTab, purchasedPatients]);

  // Get real counts from contract
  const patientsSharing = sharingEnabledCount ? Number(sharingEnabledCount) : 0;
  const recordsAvailable = totalDataShares ? Number(totalDataShares) : 0;
  const totalPatientsCount = totalPatients ? Number(totalPatients) : 0;

  // Extract patient data
  const isRegistered = patientInfo?.[0] as boolean;
  const sharingEnabled = patientInfo?.[1] as boolean;
  const dataShareCount = patientInfo?.[4] ? Number(patientInfo[4]) : 0;
  const recordCountNum = recordCount ? Number(recordCount) : 0;

  // ✅ CORRECT ACCESS CHECK: Compare access round to current dataShareCount
  // The contract's hasResearcherAccess() function has a bug - it only checks > 0
  // So we manually check if researcherAccessRound == dataShareCount for proper validation
  const hasAccess = researcherAccessRound && dataShareCount > 0 && 
                    Number(researcherAccessRound) === dataShareCount;

  // Debug access status changes
  useEffect(() => {
    console.log('🔐 Access Status Update:', {
      selectedPatient,
      researcherAccessRound: researcherAccessRound ? Number(researcherAccessRound) : 0,
      dataShareCount,
      hasAccess,
      accessValid: researcherAccessRound && dataShareCount > 0 && Number(researcherAccessRound) === dataShareCount,
      isRegistered,
      sharingEnabled
    });
    
    // Clear cached handles if access has expired (patient shared new data)
    if (selectedPatient && researcherAccessRound && dataShareCount > 0) {
      const currentRound = Number(researcherAccessRound);
      if (currentRound !== dataShareCount) {
        console.log('⚠️ Access expired! Clearing cached handles...');
        const healthKey = getHealthHandlesCacheKey(
          selectedPatient,
          recordIndex,
          address,
          dataShareCount
        );
        const riskKey = getRiskHandlesCacheKey(
          selectedPatient,
          recordIndex,
          address,
          dataShareCount
        );
        localStorage.removeItem(healthKey);
        localStorage.removeItem(riskKey);
      }
    }
  }, [hasAccess, researcherAccessRound, dataShareCount, selectedPatient, address, recordIndex]);

  // Extract risk scores from decrypted state (v0.9 client-side decrypt)
  const riskDiabetes = decryptedRiskData?.diabetesRisk ?? null;
  const riskHeartDisease = decryptedRiskData?.heartDiseaseRisk ?? null;
  const riskStroke = decryptedRiskData?.strokeRisk ?? null;
  const risksDecrypted = !!decryptedRiskData;

  // Debug: Log encrypted risks updates
  useEffect(() => {
    console.log('📊 Encrypted risks updated:', encryptedRisks);
  }, [encryptedRisks]);

  // Extract health data from decrypted state (v0.9 client-side decrypt)
  const isDecrypted = !!decryptedHealthData;
  const bloodSugar = decryptedHealthData?.bloodSugar ?? null;
  const cholesterol = decryptedHealthData?.cholesterol ?? null;
  const bmi = decryptedHealthData?.bmi ?? null;
  const bloodPressureSystolic = decryptedHealthData?.bloodPressureSystolic ?? null;
  const bloodPressureDiastolic = decryptedHealthData?.bloodPressureDiastolic ?? null;
  const heartRate = decryptedHealthData?.heartRate ?? null;
  const weight = decryptedHealthData?.weight ?? null;
  const height = decryptedHealthData?.height ?? null;
  const timestamp = null; // Timestamp comes from metadata, not encrypted record

  // Update current step based on progress
  useEffect(() => {
    if (!selectedPatient) {
      setCurrentStep(1);
    } else if (!hasAccess) {
      setCurrentStep(1); // Need to purchase
    } else if (!isDecrypted && !risksDecrypted) {
      setCurrentStep(2); // Can decrypt data
    } else {
      setCurrentStep(3); // Viewing results
    }
  }, [selectedPatient, hasAccess, isDecrypted, risksDecrypted]);

  const handlePurchaseAccess = () => {
    if (!selectedPatient) {
      toast.error('Please select a patient first');
      return;
    }

    if (!accessPrice) {
      toast.error('Unable to calculate access price. Please try again.');
      return;
    }

    console.log('🔄 Purchasing access for patient:', selectedPatient);
    console.log('Record index:', recordIndex);
    console.log('Dynamic access price:', formatEther(accessPrice as bigint), 'ETH');

    try {
      purchaseAccess({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'purchaseResearcherAccess',
        args: [selectedPatient as `0x${string}`, BigInt(recordIndex)],
        value: accessPrice as bigint,
        gas: 8000000n, // Increased gas limit for purchase operations
      } as any);
    } catch (error: any) {
      console.error('❌ Purchase access error:', error);
      toast.error(error?.message || 'Failed to purchase access');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLE CACHING SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  // FHE.allow() creates PERMANENT ACL entries in Gateway/KMS (Zama confirmed).
  // Once permission is granted, handles can be decrypted unlimited times without
  // new transactions. We cache handles in localStorage to avoid wasteful re-grants.
  //
  // Flow:
  // 1. First decrypt: Call transaction (grants FHE.allow() + emits event with handles)
  // 2. Parse event → Cache handles to localStorage
  // 3. Subsequent decrypts: Use cached handles directly (NO transaction!)
  // 4. Cache invalidation: When patient shares new data (dataShareCount changes),
  //    old handles become invalid → clear cache
  // ═══════════════════════════════════════════════════════════════════════════

  // Helper to generate cache key for health record handles
  // Includes contract, patient, researcher, record index, and dataShareCount
  const getHealthHandlesCacheKey = (
    patient: string,
    recordIdx: string,
    researcher: string | undefined,
    shareCount: number
  ) => {
    const researcherPart = researcher ? researcher.toLowerCase() : 'unknown';
    return `cerebrum_health_handles_${CEREBRUM_CONTRACT_ADDRESS.toLowerCase()}_${patient.toLowerCase()}_${researcherPart}_${recordIdx}_${shareCount}`;
  };

  // Helper to generate cache key for risk score handles
  // Includes contract, patient, researcher, record index, and dataShareCount
  const getRiskHandlesCacheKey = (
    patient: string,
    recordIdx: string,
    researcher: string | undefined,
    shareCount: number
  ) => {
    const researcherPart = researcher ? researcher.toLowerCase() : 'unknown';
    return `cerebrum_risk_handles_${CEREBRUM_CONTRACT_ADDRESS.toLowerCase()}_${patient.toLowerCase()}_${researcherPart}_${recordIdx}_${shareCount}`;
  };

  // v0.9: Client-side decryption of health record
  const handleDecryptHealthRecord = async () => {
    if (!selectedPatient || !hasAccess) {
      toast.error('Please purchase access first');
      return;
    }

    setIsDecryptingHealth(true);
    
    // Check if we already have cached handles from previous permission grant
    const cacheKey = getHealthHandlesCacheKey(
      selectedPatient,
      recordIndex,
      address,
      dataShareCount
    );
    const cachedHandles = localStorage.getItem(cacheKey);
    
    if (cachedHandles) {
      console.log('🎯 [ResearcherPortal] Found cached handles! Skipping transaction...');
      toast.loading('🔓 Decrypting with existing permissions...', { id: 'health-permission' });
      
      try {
        const handles = JSON.parse(cachedHandles);
        console.log('✅ [ResearcherPortal] Using cached handles:', handles);
        
        const decrypted = await decryptHealthRecord(handles);
        console.log('✅ [ResearcherPortal] Decrypted health data:', decrypted);
        setDecryptedHealthData(decrypted);
        toast.success('✅ Health record decrypted successfully!', { id: 'health-permission' });
        setIsDecryptingHealth(false);
        return;
      } catch (error: any) {
        console.warn('⚠️ [ResearcherPortal] Cached handles failed, requesting new permission...', error);
        // Fall through to transaction if cached decrypt fails
      }
    }
    
    toast.loading('🔐 Requesting permission to decrypt health data...', { id: 'health-permission' });
    
    try {
      console.log('🔬 [ResearcherPortal] Starting health record decryption...');
      console.log('📝 Step 1: Calling getEncryptedHealthRecord to grant FHE.allow() permissions...');
      
      // Step 1: Call getEncryptedHealthRecord as transaction to grant permanent FHE.allow() permissions
      grantPermissionForHealth({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'getEncryptedHealthRecord',
        args: [selectedPatient as `0x${string}`, BigInt(recordIndex)],
      } as any);

      // Step 2: After permission granted, decrypt (handled in useEffect below)
    } catch (error: any) {
      console.error('❌ [ResearcherPortal] Failed to start health decryption:', error);
      toast.error('Failed to start decryption', { id: 'health-permission' });
      setIsDecryptingHealth(false);
    }
  };

  // Handle health permission granted -> decrypt
  useEffect(() => {
    if (!isHealthPermissionGranted || !healthPermissionReceipt || !selectedPatient) {
      console.log('🔍 [Health Decrypt] Waiting for conditions:', {
        isHealthPermissionGranted,
        hasReceipt: !!healthPermissionReceipt,
        selectedPatient
      });
      return;
    }

    const performHealthDecrypt = async () => {
      try {
        toast.success('✅ Permission granted! Parsing event...', { id: 'health-permission' });
        console.log('✅ [ResearcherPortal] Permission granted! Parsing event from transaction logs...');
        
        // Parse HealthDataPermissionGranted event from receipt
        console.log('📋 [ResearcherPortal] Receipt logs:', healthPermissionReceipt.logs);
        
        // Find the HealthDataPermissionGranted event (4 topics: signature + 3 indexed params)
        const healthEvent = healthPermissionReceipt.logs.find((log: any) => {
          return log.address?.toLowerCase() === CEREBRUM_CONTRACT_ADDRESS.toLowerCase() && 
                 log.topics?.length === 4;
        });
        
        if (!healthEvent) {
          console.error('❌ [ResearcherPortal] HealthDataPermissionGranted event not found');
          console.log('📊 Available logs:', healthPermissionReceipt.logs.map((log: any) => ({
            address: log.address,
            topics: log.topics?.length,
            data: log.data
          })));
          toast.error('Event not found in transaction receipt', { id: 'health-permission' });
          setIsDecryptingHealth(false);
          return;
        }
        
        console.log('✅ Found HealthDataPermissionGranted event:', healthEvent);
        
        // Parse the data field (8 bytes32 handles + 1 uint256 timestamp)
        // Each bytes32 is 64 hex chars (32 bytes)
        const { data } = healthEvent;
        const hexData = data.slice(2); // Remove 0x prefix
        
        const bloodSugarHandle = '0x' + hexData.slice(0, 64);
        const cholesterolHandle = '0x' + hexData.slice(64, 128);
        const bmiHandle = '0x' + hexData.slice(128, 192);
        const bpSystolicHandle = '0x' + hexData.slice(192, 256);
        const bpDiastolicHandle = '0x' + hexData.slice(256, 320);
        const heartRateHandle = '0x' + hexData.slice(320, 384);
        const weightHandle = '0x' + hexData.slice(384, 448);
        const heightHandle = '0x' + hexData.slice(448, 512);
        // timestamp is at positions 512-576 (unused for decryption)
        
        console.log('🔐 Parsed handles from event:');
        console.log('  Blood Sugar:', bloodSugarHandle);
        console.log('  Cholesterol:', cholesterolHandle);
        console.log('  BMI:', bmiHandle);
        console.log('  BP Systolic:', bpSystolicHandle);
        console.log('  BP Diastolic:', bpDiastolicHandle);
        console.log('  Heart Rate:', heartRateHandle);
        console.log('  Weight:', weightHandle);
        console.log('  Height:', heightHandle);
        
        // Cache handles for future decrypts (permissions are permanent!)
        const handlesObj = {
          bloodSugar: bloodSugarHandle,
          cholesterol: cholesterolHandle,
          bmi: bmiHandle,
          bloodPressureSystolic: bpSystolicHandle,
          bloodPressureDiastolic: bpDiastolicHandle,
          heartRate: heartRateHandle,
          weight: weightHandle,
          height: heightHandle,
        };
        
        const cacheKey = getHealthHandlesCacheKey(
          selectedPatient,
          recordIndex,
          address,
          dataShareCount
        );
        localStorage.setItem(cacheKey, JSON.stringify(handlesObj));
        console.log('💾 [ResearcherPortal] Cached handles to localStorage for future use');
        
        // Decrypt using userDecrypt()
        console.log('🔐 [ResearcherPortal] Starting batch decrypt for 8 values...');
        
        const decrypted = await decryptHealthRecord(handlesObj);

        console.log('✅ [ResearcherPortal] Decrypted health data:', decrypted);
        setDecryptedHealthData(decrypted);
        toast.success('✅ Health record decrypted successfully!', { id: 'health-permission' });
      } catch (error: any) {
        console.error('❌ [ResearcherPortal] Failed to decrypt health record:', error);
        console.error('❌ [ResearcherPortal] Error stack:', error.stack);
        toast.error(`Failed to decrypt: ${error.message || 'Unknown error'}`, { id: 'health-permission' });
      } finally {
        setIsDecryptingHealth(false);
      }
    };

    performHealthDecrypt();
  }, [isHealthPermissionGranted, healthPermissionReceipt, selectedPatient, decryptHealthRecord]);

  // v0.9: Client-side decryption of risk scores
  const handleDecryptRiskScores = async () => {
    if (!selectedPatient || !hasAccess) {
      toast.error('Please purchase access first');
      return;
    }

    setIsDecryptingRisks(true);
    
    // Check if we already have cached handles from previous permission grant
    const cacheKey = getRiskHandlesCacheKey(
      selectedPatient,
      recordIndex,
      address,
      dataShareCount
    );
    const cachedHandles = localStorage.getItem(cacheKey);
    
    if (cachedHandles) {
      console.log('🎯 [ResearcherPortal] Found cached risk handles! Skipping transaction...');
      toast.loading('🔓 Decrypting with existing permissions...', { id: 'risk-permission' });
      
      try {
        const handles = JSON.parse(cachedHandles);
        console.log('✅ [ResearcherPortal] Using cached risk handles:', handles);
        
        const decrypted = await decryptRiskScores(handles);
        console.log('✅ [ResearcherPortal] Decrypted risk scores:', decrypted);
        setDecryptedRiskData(decrypted);
        toast.success('✅ Risk scores decrypted successfully!', { id: 'risk-permission' });
        setIsDecryptingRisks(false);
        return;
      } catch (error: any) {
        console.warn('⚠️ [ResearcherPortal] Cached risk handles failed, requesting new permission...', error);
        // Fall through to transaction if cached decrypt fails
      }
    }
    
    toast.loading('🔐 Requesting permission to decrypt risk scores...', { id: 'risk-permission' });
    
    try {
      console.log('🔬 [ResearcherPortal] Calling getEncryptedRiskScores to grant permission...');
      
      // Step 1: Call getEncryptedRiskScores as transaction to grant FHE.allow() permission
      // This doesn't return data (it's a transaction), but grants permanent permission
      grantPermissionForRisks({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'getEncryptedRiskScores',
        args: [selectedPatient as `0x${string}`, BigInt(recordIndex)],
      } as any);

      // The useEffect below will handle the actual decryption after permission is granted

    } catch (error: any) {
      console.error('❌ [ResearcherPortal] Failed to grant permission:', error);
      toast.error(error?.message || 'Failed to grant permission');
      setIsDecryptingRisks(false);
    }
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
          <p className="text-gray-400">Please connect your wallet to access the Researcher Portal</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Transaction Modals (v0.9: only purchase, decrypt is instant client-side!) */}
      <TransactionModal show={isPurchasing} txHash={purchaseHash} title="Purchasing Access..." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Researcher Analytics Portal
          </h1>
          <p className="text-gray-400 text-lg mb-6">Access encrypted health data for research and analysis</p>
          
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
              <span>Browse Patients</span>
            </div>
            <div className="text-emerald-500">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">2</div>
              <span>Purchase Access</span>
            </div>
            <div className="text-emerald-500">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">3</div>
              <span>Analyze Data</span>
            </div>
          </div>
        </motion.div>

        {/* Real-Time Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <Users className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-sm text-gray-400 mb-2">Patients Sharing Data</h3>
            <div className="text-4xl font-bold text-emerald-400">
              <AnimatedNumber value={patientsSharing} />
              {totalPatientsCount > 0 && (
                <span className="text-lg text-gray-500 ml-2">/ {totalPatientsCount}</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {patientsSharing > 0 ? 'Actively contributing to research' : 'No patients sharing yet'}
            </p>
          </div>

          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <Database className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-sm text-gray-400 mb-2">Records Available</h3>
            <div className="text-4xl font-bold text-emerald-400">
              <AnimatedNumber value={recordsAvailable} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Total health data points</p>
          </div>

          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <DollarSign className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-sm text-gray-400 mb-2">Access Fee</h3>
            <div className="text-4xl font-bold text-emerald-400">0.01</div>
            <p className="text-xs text-gray-500 mt-2">ETH per patient access</p>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-500/15 border-2 border-yellow-500/40 rounded-2xl p-6 mb-8 shadow-lg shadow-yellow-500/10"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Access Reset Policy</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                When a patient shares new health data, your access expires and you must purchase access again. 
                Price varies based on data quality (0.008-0.03 ETH). This ensures patients are compensated for every data update.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Patient Discovery - Tabbed Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8 mb-8 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-emerald-400" />
              <h2 className="text-2xl font-bold">Patient Discovery</h2>
            </div>
            <button
              onClick={() => {
                refetchPatient();
                refetchPurchased();
                toast.success('Data refreshed!');
              }}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
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
                Browse All ({rankedPatients.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('purchased')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'purchased'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                My Access ({purchasedPatients ? (purchasedPatients as any[]).length : 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'recent'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recently Active
              </div>
            </button>
          </div>

          {/* Tab Description */}
          <p className="text-sm text-gray-400 mb-6">
            {activeTab === 'all' && 'All patients ranked by data contributions. More data = higher research value.'}
            {activeTab === 'purchased' && 'Patients you have purchased access to. Check for expired access.'}
            {activeTab === 'recent' && 'Patients who recently shared new health data.'}
          </p>

          {/* Patient List */}
          <div className="space-y-3">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => (
                <PatientCard
                  key={patient.address}
                  rank={index + 1}
                  address={patient.address}
                  isSelected={selectedPatient === patient.address}
                  onSelect={() => setSelectedPatient(patient.address)}
                  showAccessBadge={activeTab === 'purchased'}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>
                  {searchQuery 
                    ? 'No patients found matching your search' 
                    : activeTab === 'purchased'
                    ? 'You haven\'t purchased access to any patients yet'
                    : 'No patients sharing data yet'}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Selected Patient Details */}
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Workflow Stepper */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-4 text-emerald-400">Research Workflow</h3>
              <div className="flex items-center justify-between">
                {/* Step 1 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${
                    currentStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {hasAccess ? '✓' : '1'}
                  </div>
                  <span className={`text-sm font-semibold ${currentStep >= 1 ? 'text-emerald-400' : 'text-gray-500'}`}>
                    Purchase Access
                  </span>
                  <span className="text-xs text-gray-500">
                    {accessPrice ? formatEther(accessPrice as bigint) : '...'} ETH
                  </span>
                </div>

                {/* Arrow */}
                <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>

                {/* Step 2 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${
                    currentStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {currentStep >= 3 ? '✓' : '2'}
                  </div>
                  <span className={`text-sm font-semibold ${currentStep >= 2 ? 'text-emerald-400' : 'text-gray-500'}`}>
                    Decrypt Data
                  </span>
                  <span className="text-xs text-gray-500">30-60s</span>
                </div>

                {/* Arrow */}
                <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>

                {/* Step 3 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${
                    currentStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    3
                  </div>
                  <span className={`text-sm font-semibold ${currentStep >= 3 ? 'text-emerald-400' : 'text-gray-500'}`}>
                    Analyze Results
                  </span>
                  <span className="text-xs text-gray-500">Instant</span>
                </div>
              </div>
            </div>

            {/* Patient Info Card */}
            <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Patient: {selectedPatient.slice(0, 6)}...{selectedPatient.slice(-4)}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`flex items-center gap-2 ${sharingEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
                      {sharingEnabled ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {sharingEnabled ? 'Sharing Enabled' : 'Sharing Disabled'}
                    </span>
                    <span className="text-gray-400">
                      {recordCountNum} records available
                    </span>
                  </div>
                </div>

                {hasAccess ? (
                  <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Access Granted</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        console.log('Button clicked!');
                        console.log('sharingEnabled:', sharingEnabled);
                        console.log('isPurchasing:', isPurchasing);
                        console.log('selectedPatient:', selectedPatient);
                        handlePurchaseAccess();
                      }}
                      disabled={isPurchasing || !sharingEnabled || !accessPrice}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPurchasing ? 'Purchasing...' : `Purchase Access (${accessPrice ? formatEther(accessPrice as bigint) : '...'} ETH)`}
                    </button>
                    <p className="text-xs text-gray-400 italic">
                      ℹ️ Price varies by data quality • Access expires when patient adds new records
                    </p>
                  </div>
                )}
              </div>

              {!sharingEnabled && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">This patient has disabled data sharing</span>
                  </div>
                </div>
              )}

              {/* Access Expired Warning */}
              {!hasAccess && purchasedPatients && (purchasedPatients as any[]).includes(selectedPatient) && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <span className="text-sm font-semibold block">⏰ Your access has expired!</span>
                      <span className="text-xs text-amber-300">Patient added new records. Purchase access again to view updated data.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Access Status Debug Info */}
            {selectedPatient && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">🔍 Access Status</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Registered:</span>
                    <span className={isRegistered ? 'text-green-400' : 'text-red-400'}>
                      {isRegistered ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sharing:</span>
                    <span className={sharingEnabled ? 'text-green-400' : 'text-red-400'}>
                      {sharingEnabled ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Records:</span>
                    <span className="text-white">{recordCountNum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Share Count:</span>
                    <span className="text-white">{dataShareCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Access Round:</span>
                    <span className="text-white">{researcherAccessRound ? Number(researcherAccessRound) : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Access Valid:</span>
                    <span className={hasAccess ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      {hasAccess ? '✓ YES' : '✗ NO'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Data Access Options - Two Clear Paths */}
            {hasAccess && (
              <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-8 h-8 text-emerald-400" />
                  <h3 className="text-2xl font-bold">Data Access Options</h3>
                </div>

                {/* Record Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Health Record</label>
                  <select
                    value={recordIndex}
                    onChange={(e) => {
                      setRecordIndex(e.target.value);
                      // Reset decrypted state when changing records
                      setDecryptedHealthData(null);
                      setDecryptedRiskData(null);
                    }}
                    className="w-full px-4 py-3 bg-black/50 border border-emerald-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    {Array.from({ length: recordCountNum }, (_, i) => (
                      <option key={i} value={i}>
                        Record #{i + 1} {i === recordCountNum - 1 && '(Latest)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Two Main Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Option 1: Decrypt & Export Raw Data */}
                  <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-emerald-500/20 rounded-lg p-3">
                        <Eye className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Option 1: Decrypt Raw Data</h4>
                        <p className="text-sm text-gray-400">Get health metrics for export</p>
                      </div>
                    </div>

                    <button
                      onClick={handleDecryptHealthRecord}
                      disabled={isDecryptingHealth || !hasAccess}
                      className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
                    >
                      {isDecryptingHealth ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Decrypting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          Decrypt Health Data
                        </>
                      )}
                    </button>

                    {isDecrypted && (
                      <DataExportButtons healthData={decryptedHealthData!} patientAddress={selectedPatient} recordIndex={recordIndex} />
                    )}
                  </div>

                  {/* Option 2: Perform Analytics */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500/20 rounded-lg p-3">
                        <BarChart3 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Option 2: Analytics & Risks</h4>
                        <p className="text-sm text-gray-400">Calculate encrypted risk scores</p>
                      </div>
                    </div>

                    <AnalyticsSection
                      patientAddress={selectedPatient}
                      recordIndex={parseInt(recordIndex)}
                      onDecryptRisks={handleDecryptRiskScores}
                      isDecrypting={isDecryptingRisks}
                      encryptedRisks={encryptedRisks}
                      decryptedRisks={decryptedRiskData}
                      refetchEncryptedRisks={refetchRiskScores}
                    />
                  </div>
                </div>

                {/* Decrypted Health Data */}
                {isDecrypted && bloodSugar !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6"
                  >
                    <h4 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Decrypted Health Data
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplet className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-gray-400">Blood Sugar</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{bloodSugar} <span className="text-sm text-gray-500">mg/dL</span></div>
                      </div>

                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-5 h-5 text-red-400" />
                          <span className="text-sm text-gray-400">Cholesterol</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{cholesterol} <span className="text-sm text-gray-500">mg/dL</span></div>
                      </div>

                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm text-gray-400">BMI</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{bmi} <span className="text-sm text-gray-500">kg/m²</span></div>
                      </div>

                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-5 h-5 text-pink-400" />
                          <span className="text-sm text-gray-400">Heart Rate</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{heartRate} <span className="text-sm text-gray-500">bpm</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-orange-400" />
                          <span className="text-sm text-gray-400">BP Systolic</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{bloodPressureSystolic} <span className="text-sm text-gray-500">mmHg</span></div>
                      </div>

                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-gray-400">BP Diastolic</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{bloodPressureDiastolic} <span className="text-sm text-gray-500">mmHg</span></div>
                      </div>

                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-purple-400" />
                          <span className="text-sm text-gray-400">Weight</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{weight} <span className="text-sm text-gray-500">kg</span></div>
                      </div>

                      <div className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-indigo-400" />
                          <span className="text-sm text-gray-400">Height</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{height} <span className="text-sm text-gray-500">cm</span></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Recorded: {timestamp ? new Date(timestamp * 1000).toLocaleString() : 'N/A'}</span>
                    </div>
                  </motion.div>
                )}

                {/* Risk Analysis Results */}
                {risksDecrypted && riskDiabetes !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6"
                  >
                    <h4 className="text-lg font-semibold mb-4 text-purple-400 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      FHE Risk Analysis Results
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-6">
                        <Droplet className="w-8 h-8 text-yellow-400 mb-4" />
                        <h5 className="text-sm font-semibold text-gray-400 mb-2">Diabetes Risk</h5>
                        <div className="text-4xl font-bold text-yellow-400 mb-2">
                          {(riskDiabetes / 10).toFixed(1)}%
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(riskDiabetes / 10)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">Blood Sugar (40%) + BMI (30%)</p>
                      </div>

                      <div className="bg-black/50 border border-red-500/20 rounded-xl p-6">
                        <Heart className="w-8 h-8 text-red-400 mb-4" />
                        <h5 className="text-sm font-semibold text-gray-400 mb-2">Heart Disease Risk</h5>
                        <div className="text-4xl font-bold text-red-400 mb-2">
                          {(riskHeartDisease / 10).toFixed(1)}%
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className="bg-red-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(riskHeartDisease / 10)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">Cholesterol (35%) + BP (25%)</p>
                      </div>

                      <div className="bg-black/50 border border-orange-500/20 rounded-xl p-6">
                        <Zap className="w-8 h-8 text-orange-400 mb-4" />
                        <h5 className="text-sm font-semibold text-gray-400 mb-2">Stroke Risk</h5>
                        <div className="text-4xl font-bold text-orange-400 mb-2">
                          {(riskStroke / 10).toFixed(1)}%
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(riskStroke / 10)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">BP (30%) + Cholesterol (25%)</p>
                      </div>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-emerald-300 font-semibold mb-1">✅ Real FHE Calculation</p>
                          <p className="text-xs text-gray-400">
                            These risk scores were calculated on ENCRYPTED health data using <span className="text-yellow-400 font-semibold">Zama</span>'s fhEVM. 
                            The raw health metrics were never decrypted during computation, preserving patient privacy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Empty State */}
                {!isDecrypted && !risksDecrypted && (
                  <div className="text-center py-12 text-gray-500">
                    <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">No Data Decrypted Yet</p>
                    <p className="text-sm mb-6">Click the buttons above to decrypt health records or calculate risk scores</p>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 max-w-2xl mx-auto">
                      <div className="flex items-start gap-2 text-xs text-blue-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>
                          <strong>Note:</strong> Decryption uses <span className="text-yellow-400 font-semibold">Zama</span> Gateway Oracle and takes 30-60 seconds.
                          The page will auto-refresh to show results.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Data Export Buttons Component
const DataExportButtons = ({ 
  healthData, 
  patientAddress,
  recordIndex 
}: { 
  healthData: {
    bloodSugar: number;
    cholesterol: number;
    bmi: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    heartRate: number;
    weight: number;
    height: number;
  };
  patientAddress: string;
  recordIndex: string;
}) => {
  const exportAsJSON = () => {
    const data = {
      patient: patientAddress,
      recordIndex: parseInt(recordIndex),
      timestamp: new Date().toISOString(),
      healthMetrics: healthData
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-data-${patientAddress.slice(0, 8)}-record-${recordIndex}.json`;
    a.click();
    toast.success('✅ Exported as JSON');
  };

  const exportAsCSV = () => {
    const csv = [
      'Metric,Value,Unit',
      `Blood Sugar,${healthData.bloodSugar},mg/dL`,
      `Cholesterol,${healthData.cholesterol},mg/dL`,
      `BMI,${healthData.bmi},kg/m²`,
      `Blood Pressure Systolic,${healthData.bloodPressureSystolic},mmHg`,
      `Blood Pressure Diastolic,${healthData.bloodPressureDiastolic},mmHg`,
      `Heart Rate,${healthData.heartRate},bpm`,
      `Weight,${healthData.weight},kg`,
      `Height,${healthData.height},cm`
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-data-${patientAddress.slice(0, 8)}-record-${recordIndex}.csv`;
    a.click();
    toast.success('✅ Exported as CSV');
  };

  const exportAsText = () => {
    const text = `
HEALTH DATA REPORT
Patient: ${patientAddress}
Record Index: ${recordIndex}
Export Date: ${new Date().toLocaleString()}

=== HEALTH METRICS ===
Blood Sugar: ${healthData.bloodSugar} mg/dL
Cholesterol: ${healthData.cholesterol} mg/dL
BMI: ${healthData.bmi} kg/m²
Blood Pressure: ${healthData.bloodPressureSystolic}/${healthData.bloodPressureDiastolic} mmHg
Heart Rate: ${healthData.heartRate} bpm
Weight: ${healthData.weight} kg
Height: ${healthData.height} cm
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-data-${patientAddress.slice(0, 8)}-record-${recordIndex}.txt`;
    a.click();
    toast.success('✅ Exported as TXT');
  };

  return (
    <div>
      <p className="text-sm text-emerald-400 mb-3 flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        Data decrypted! Export in your preferred format:
      </p>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={exportAsJSON}
          className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1"
        >
          <Database className="w-4 h-4" />
          JSON
        </button>
        <button
          onClick={exportAsCSV}
          className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1"
        >
          <Database className="w-4 h-4" />
          CSV
        </button>
        <button
          onClick={exportAsText}
          className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1"
        >
          <Database className="w-4 h-4" />
          TXT
        </button>
      </div>
    </div>
  );
};

// Analytics Section Component
const AnalyticsSection = ({
  patientAddress,
  recordIndex,
  onDecryptRisks,
  isDecrypting,
  encryptedRisks,
  decryptedRisks,
  refetchEncryptedRisks
}: {
  patientAddress: string;
  recordIndex: number;
  onDecryptRisks: () => void;
  isDecrypting: boolean;
  encryptedRisks: any;
  decryptedRisks: {
    diabetesRisk: number;
    heartDiseaseRisk: number;
    strokeRisk: number;
  } | null;
  refetchEncryptedRisks: () => void;
}) => {
  const { writeContract: calculateRisks, data: calculateHash } = useWriteContract();
  const { isLoading: isCalculating, isSuccess: isCalculateSuccess, data: calculateReceipt } = useWaitForTransactionReceipt({
    hash: calculateHash,
  });

  // FHEVM v0.9 Client-Side Decryption
  const { decryptRiskScores } = useResearcherFhevm(CEREBRUM_CONTRACT_ADDRESS);

  // State to store encrypted handles from event
  const [encryptedHandles, setEncryptedHandles] = useState<readonly [string, string, string] | null>(null);
  const [isDecryptingLocal, setIsDecryptingLocal] = useState(false);
  const [localDecryptedRisks, setLocalDecryptedRisks] = useState<{
    diabetesRisk: number;
    heartDiseaseRisk: number;
    strokeRisk: number;
  } | null>(null);

  // Parse event after calculate success
  useEffect(() => {
    if (isCalculateSuccess && calculateReceipt) {
      console.log('✅ Risk calculation complete! Parsing event...');
      console.log('� Receipt logs:', calculateReceipt.logs);
      
      try {
        // Parse RiskScoresCalculated event
        // Event signature: RiskScoresCalculated(address indexed patient, address indexed researcher, uint256 recordIndex, bytes32 diabetesHandle, bytes32 heartHandle, bytes32 strokeHandle, uint256 timestamp)
        // Topics: [eventSignature, patient, researcher] (recordIndex is NOT indexed)
        // Data: recordIndex (32 bytes) + diabetesHandle (32 bytes) + heartHandle (32 bytes) + strokeHandle (32 bytes) + timestamp (32 bytes)
        
        // Debug: Log all event addresses and topic counts
        console.log('🔍 Searching for RiskScoresCalculated event...');
        console.log('📍 Expected contract address:', CEREBRUM_CONTRACT_ADDRESS.toLowerCase());
        calculateReceipt.logs.forEach((log: any, idx: number) => {
          console.log(`Log ${idx}: address=${log.address?.toLowerCase()}, topics=${log.topics?.length}`);
        });
        
        const riskEvent = calculateReceipt.logs.find((log: any) => {
          // Filter by contract address and topic count
          const isMatch = log.address?.toLowerCase() === CEREBRUM_CONTRACT_ADDRESS.toLowerCase() && 
                 log.topics && 
                 log.topics.length === 4; // 3 indexed params + event signature (recordIndex IS indexed!)
          
          if (isMatch) {
            console.log('✅ Found matching event!', log);
          }
          
          return isMatch;
        });

        if (riskEvent) {
          console.log('📝 Found RiskScoresCalculated event:', riskEvent);
          console.log('📊 Raw event data:', riskEvent.data);
          console.log('📊 Event data length:', riskEvent.data.length);
          
          // Decode event data (non-indexed parameters)
          // With recordIndex indexed, data contains: diabetesHandle (bytes32), heartHandle (bytes32), strokeHandle (bytes32), timestamp (uint256)
          const data = riskEvent.data;
          
          // Parse hex data (remove 0x prefix)
          const hexData = data.slice(2);
          console.log('📊 Hex data length (chars):', hexData.length);
          console.log('📊 Hex data (full):', hexData);
          
          // Each bytes32/uint256 is 64 hex chars (32 bytes)
          // Data: diabetesHandle + heartHandle + strokeHandle + timestamp
          const diabetesHandle = '0x' + hexData.slice(0, 64);
          const heartHandle = '0x' + hexData.slice(64, 128);
          const strokeHandle = '0x' + hexData.slice(128, 192);
          
          console.log('🔐 Parsed from event:');
          console.log('   Diabetes:', diabetesHandle);
          console.log('   Heart:', heartHandle);
          console.log('   Stroke:', strokeHandle);
          
          // Cache handles for future decrypts (permissions are permanent!)
          const handlesObj = {
            diabetesRisk: diabetesHandle,
            heartDiseaseRisk: heartHandle,
            strokeRisk: strokeHandle,
          };

          // Build risk cache key using patientAddress (researcher == patient in this flow)
          const riskResearcherPart = patientAddress.toLowerCase();
          const riskCacheKey = `cerebrum_risk_handles_${CEREBRUM_CONTRACT_ADDRESS.toLowerCase()}_${patientAddress.toLowerCase()}_${riskResearcherPart}_${recordIndex}`;
          localStorage.setItem(riskCacheKey, JSON.stringify(handlesObj));
          console.log('💾 [ResearcherPortal] Cached risk handles to localStorage for future use');
          
          setEncryptedHandles([diabetesHandle, heartHandle, strokeHandle] as const);
          
          toast.success('✅ Risk scores calculated! Handles retrieved from event.');
          
          // Auto-decrypt immediately since we have FHE.allow() permission
          setTimeout(() => {
            handleAutoDecrypt([diabetesHandle, heartHandle, strokeHandle] as const);
          }, 1000);
        } else {
          console.warn('⚠️ RiskScoresCalculated event not found in logs');
          toast.error('Risk calculated but could not parse event. Check console.');
        }
      } catch (error: any) {
        console.error('❌ Failed to parse event:', error);
        toast.error('Failed to parse calculation event');
      }
    }
  }, [isCalculateSuccess, calculateReceipt, patientAddress, recordIndex]);

  const handleAutoDecrypt = async (handles: readonly [string, string, string]) => {
    setIsDecryptingLocal(true);
    toast.loading('🔓 Decrypting risk scores...', { id: 'decrypt-risks' });
    
    try {
      console.log('🔬 Starting auto-decrypt with handles:', handles);
      
      const decrypted = await decryptRiskScores({
        diabetesRisk: handles[0],
        heartDiseaseRisk: handles[1],
        strokeRisk: handles[2],
      });

      toast.dismiss('decrypt-risks');
      setLocalDecryptedRisks(decrypted);
      toast.success('✅ Risk scores decrypted!');
      console.log('✅ Decrypted risk scores:', decrypted);
    } catch (error: any) {
      toast.dismiss('decrypt-risks');
      console.error('❌ Auto-decrypt failed:', error);
      toast.error(error?.message || 'Failed to decrypt');
    } finally {
      setIsDecryptingLocal(false);
    }
  };

  const handleCalculate = () => {
    try {
      console.log('🧮 Calculating risks for:', patientAddress, 'Record:', recordIndex);
      calculateRisks({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'calculateComprehensiveRisk',
        args: [patientAddress as `0x${string}`, BigInt(recordIndex)],
        gas: 8000000n,
      } as any);
    } catch (error: any) {
      console.error('❌ Calculate risk error:', error);
      toast.error(error?.message || 'Failed to calculate risk scores');
    }
  };

  return (
    <div>
      {/* Step 1: Calculate */}
      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
      >
        {isCalculating ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Calculating on FHE...
          </>
        ) : (
          <>
            <Activity className="w-5 h-5" />
            Calculate Risk Scores
          </>
        )}
      </button>

      {/* Show status after calculation */}
      {isCalculateSuccess && !localDecryptedRisks && isDecryptingLocal && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-3">
          <p className="text-sm text-emerald-400 mb-3 flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            Decrypting risk scores automatically...
          </p>
        </div>
      )}

      {/* Decrypted Results Display */}
      {localDecryptedRisks && (
        <div className="bg-black/30 border border-green-500/20 rounded-lg p-4 space-y-3">
          <p className="text-sm text-green-400 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            ✅ Decrypted Risk Scores:
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Diabetes Risk</span>
              <span className="text-lg font-bold text-yellow-400">{(localDecryptedRisks.diabetesRisk / 10).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Heart Disease Risk</span>
              <span className="text-lg font-bold text-red-400">{(localDecryptedRisks.heartDiseaseRisk / 10).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Stroke Risk</span>
              <span className="text-lg font-bold text-orange-400">{(localDecryptedRisks.strokeRisk / 10).toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-green-500/20">
            <p className="text-xs text-green-300">
              ✨ Calculated on encrypted data using Zama's FHE
            </p>
          </div>
        </div>
      )}

      {/* Info Box - No Results Yet */}
      {!encryptedHandles && !isCalculateSuccess && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-xs text-blue-300">
            ℹ️ Click "Calculate Risk Scores" to perform analytics on encrypted health data
          </p>
        </div>
      )}
    </div>
  );
};

// Patient Card Component
const PatientCard = ({ 
  rank, 
  address, 
  isSelected, 
  onSelect,
  showAccessBadge = false
}: { 
  rank: number; 
  address: string; 
  isSelected: boolean; 
  onSelect: () => void;
  showAccessBadge?: boolean;
}) => {
  // Query patient info for each card
  const { data: patientInfo } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientInfo',
    args: [address as `0x${string}`],
  });

  const { data: recordCount } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getHealthRecordCount',
    args: [address as `0x${string}`],
  });

  const sharingEnabled = patientInfo?.[1] as boolean;
  const dataShareCount = patientInfo?.[4] ? Number(patientInfo[4]) : 0;
  const recordCountNum = recordCount ? Number(recordCount) : 0;

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
            <span className="text-emerald-400 font-bold text-lg">#{rank}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-mono text-white font-semibold">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              {showAccessBadge && (
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs text-emerald-400 font-semibold">
                  ✓ Access
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-emerald-400 flex items-center gap-1">
                <Database className="w-4 h-4" />
                {recordCountNum} records
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

export default ResearcherPortal;
