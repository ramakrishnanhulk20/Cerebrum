import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Microscope, Search, Lock, DollarSign, Users, Database, AlertCircle, CheckCircle, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts';
import { formatEther, parseEther, isAddress } from 'viem';

const RESEARCHER_ACCESS_FEE = parseEther('0.01');

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

const ResearcherPortal = () => {
  const { address, isConnected } = useAccount();
  const [patientAddress, setPatientAddress] = useState('');
  const [recordIndex, setRecordIndex] = useState('0');
  const [searchedPatient, setSearchedPatient] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Read data
  const { data: totalPatients } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getTotalPatients',
  });

  const { data: hasAccess, refetch: refetchAccess } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'hasResearcherAccess',
    args: searchedPatient && address ? [searchedPatient as `0x${string}`, address] : undefined,
  });

  const { data: recordCount } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getHealthRecordCount',
    args: searchedPatient ? [searchedPatient as `0x${string}`] : undefined,
  });

  // Debug logging for query params
  useEffect(() => {
    if (searchedPatient && address && recordIndex !== undefined) {
      console.log('🔍 QUERY PARAMS:', {
        contractAddress: CEREBRUM_CONTRACT_ADDRESS,
        functionName: 'decryptedRecords',
        patient: searchedPatient,
        researcher: address,
        recordIndex: recordIndex,
        recordIndexBigInt: BigInt(recordIndex),
        timestamp: new Date().toISOString(),
      });
    }
  }, [searchedPatient, address, recordIndex]);

  // Query decryptedRecords mapping directly with all 3 parameters
  const { data: decryptedRecord, refetch: refetchRecord } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'decryptedRecords',
    args: searchedPatient && address ? [
      searchedPatient as `0x${string}`, 
      address as `0x${string}`, 
      BigInt(recordIndex)
    ] : undefined,
  });

  // Write functions
  const { writeContract: purchaseAccess, data: purchaseHash, error: purchaseError } = useWriteContract();
  const { writeContract: requestDecryption, data: decryptHash, error: decryptError } = useWriteContract();

  const { isLoading: isPurchasing, isSuccess: purchaseSuccess } = useWaitForTransactionReceipt({ hash: purchaseHash });
  const { isLoading: isDecrypting, isSuccess: decryptSuccess } = useWaitForTransactionReceipt({ hash: decryptHash });

  // Debug errors
  useEffect(() => {
    if (purchaseError) {
      console.error('❌ Purchase error:', purchaseError);
      toast.error('Purchase failed: ' + purchaseError.message);
    }
  }, [purchaseError]);

  useEffect(() => {
    if (decryptError) {
      console.error('❌ Decrypt error:', decryptError);
      toast.error('Decryption request failed: ' + decryptError.message);
    }
  }, [decryptError]);

  useEffect(() => {
    if (purchaseSuccess) {
      toast.success('✅ Access purchased successfully!');
      refetchAccess();
    }
  }, [purchaseSuccess, refetchAccess]);

  // Auto-refresh after decrypt request
  useEffect(() => {
    if (decryptSuccess) {
      console.log('✅ Decrypt transaction confirmed! Starting auto-refresh...');
      toast.success('🔓 Decryption requested! Auto-refreshing data...');
      setAutoRefresh(true);
      
      let pollCount = 0;
      const maxPolls = 24; // 2 minutes (24 * 5 seconds)
      
      // Start polling every 5 seconds
      const interval = setInterval(() => {
        pollCount++;
        console.log(`🔄 Polling for decrypted data... (${pollCount}/${maxPolls})`);
        refetchRecord();
      }, 5000);
      
      // Stop after 2 minutes
      setTimeout(() => {
        clearInterval(interval);
        setAutoRefresh(false);
        console.log('⏱️ Auto-refresh stopped after 2 minutes');
        toast('💡 If data not showing, click Refresh button or check Etherscan');
      }, 120000);
      
      return () => clearInterval(interval);
    }
  }, [decryptSuccess, refetchRecord]);

  const handleSearch = () => {
    if (!isAddress(patientAddress)) {
      toast.error('Invalid patient address');
      return;
    }
    console.log('🔍 Searching for patient:', patientAddress);
    setSearchedPatient(patientAddress);
    setRecordIndex('0'); // Reset to first record when searching new patient
    toast.success('Patient lookup successful!');
  };

  const handlePurchaseAccess = async () => {
    if (!searchedPatient) {
      toast.error('No patient selected');
      return;
    }

    console.log('🛒 Purchasing access for:', searchedPatient);

    try {
      await purchaseAccess({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'purchaseResearcherAccess',
        args: [searchedPatient as `0x${string}`],
        value: RESEARCHER_ACCESS_FEE,
      });
      console.log('✅ Purchase transaction sent');
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      if (!error.message?.includes('User rejected')) {
        toast.error('Transaction failed: ' + (error.shortMessage || error.message));
      }
    }
  };

  const handleRequestDecryption = () => {
    if (!searchedPatient) {
      toast.error('No patient selected');
      return;
    }

    if (!hasAccess) {
      toast.error('You need to purchase access first');
      return;
    }

    console.log('🔍 Requesting decryption for:', {
      patient: searchedPatient,
      recordIndex: recordIndex,
      researcher: address,
      contract: CEREBRUM_CONTRACT_ADDRESS,
      timestamp: new Date().toISOString()
    });

    try {
      requestDecryption({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'requestHealthRecordDecryption',
        args: [searchedPatient as `0x${string}`, BigInt(recordIndex)],
      });
      console.log('✅ Decryption request sent to wallet');
    } catch (error: any) {
      console.error('❌ Decryption request error:', error);
      if (!error.message?.includes('User rejected')) {
        toast.error('Failed: ' + (error.shortMessage || error.message));
      }
    }
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    toast('🔄 Refreshing data...');
    refetchRecord();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-strong rounded-3xl p-12 text-center max-w-md"
        >
          <Lock className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to access the Researcher Portal</p>
        </motion.div>
      </div>
    );
  }

  const totalRecords = recordCount ? Number(recordCount) : 0;
  
  // FIXED: Extract data from array - mapping returns tuple as array
  // Array format: [bloodSugar, cholesterol, bmi, timestamp, isDecrypted]
  const recordData = decryptedRecord as any;
  const bloodSugar = recordData?.[0] ? Number(recordData[0]) : null;
  const cholesterol = recordData?.[1] ? Number(recordData[1]) : null;
  const bmi = recordData?.[2] ? Number(recordData[2]) : null;
  const timestamp = recordData?.[3] ? Number(recordData[3]) : null;
  const isDecrypted = recordData?.[4] as boolean || false;

  console.log('📊 Decrypted Record Data:', {
    bloodSugar,
    cholesterol,
    bmi,
    timestamp,
    isDecrypted,
    raw: recordData,
    patient: searchedPatient,
    researcher: address,
    recordIndex: recordIndex,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">
                Researcher Portal
              </h1>
              <p className="text-sm text-gray-400 font-mono">{address}</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Microscope className="w-12 h-12 text-emerald-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
            className="glass-strong rounded-2xl p-6"
          >
            <Users className="w-8 h-8 text-emerald-400 mb-3" />
            <div className="text-4xl font-bold text-emerald-400 mb-1">
              <AnimatedNumber value={totalPatients ? Number(totalPatients) : 0} />
            </div>
            <div className="text-sm text-gray-400">Total Patients</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
            className="glass-strong rounded-2xl p-6"
          >
            <Database className="w-8 h-8 text-emerald-400 mb-3" />
            <div className="text-4xl font-bold text-emerald-400 mb-1">
              {searchedPatient && hasAccess ? totalRecords : 0}
            </div>
            <div className="text-sm text-gray-400">Accessible Records</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
            className="glass-strong rounded-2xl p-6"
          >
            <DollarSign className="w-8 h-8 text-emerald-400 mb-3" />
            <div className="text-4xl font-bold text-emerald-400 mb-1">
              {formatEther(RESEARCHER_ACCESS_FEE)}
            </div>
            <div className="text-sm text-gray-400">Access Fee (ETH)</div>
          </motion.div>
        </div>

        {/* Patient Lookup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Search className="w-6 h-6 text-emerald-400 mr-2" />
            Patient Lookup
          </h2>

          <div className="flex gap-3 mb-6">
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              placeholder="Enter Patient Address (0x...)"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              className="flex-1 input-base"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            >
              Search
            </motion.button>
          </div>

          {searchedPatient && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Access Status */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Access Status</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    hasAccess 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  }`}>
                    {hasAccess ? '✓ Active' : '✗ No Access'}
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-4">
                  Patient: <span className="text-white font-mono">{searchedPatient}</span>
                </div>

                {!hasAccess && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePurchaseAccess}
                    disabled={isPurchasing}
                    className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
                  >
                    {isPurchasing ? 'Purchasing...' : `Purchase Access for ${formatEther(RESEARCHER_ACCESS_FEE)} ETH`}
                  </motion.button>
                )}

                {hasAccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-sm">
                    <div className="flex items-center gap-2 text-emerald-300 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold">Access Granted</span>
                    </div>
                    <div className="text-gray-400">
                      • You can view all {totalRecords} health records
                      <br />• Patient receives 80% ({formatEther(RESEARCHER_ACCESS_FEE * BigInt(80) / BigInt(100))} ETH)
                      <br />• Platform receives 20% fee
                    </div>
                  </div>
                )}
              </div>

              {/* Health Records Viewer */}
              {hasAccess && totalRecords > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Database className="w-5 h-5 text-emerald-400 mr-2" />
                    Health Records ({totalRecords} available)
                  </h3>

                  <div className="flex gap-3 mb-4">
                    <select
                      value={recordIndex}
                      onChange={(e) => {
                        console.log('📝 Record index changed to:', e.target.value);
                        setRecordIndex(e.target.value);
                      }}
                      className="flex-1 input-base"
                    >
                      {Array.from({ length: totalRecords }, (_, i) => (
                        <option key={i} value={i}>Record #{i + 1}</option>
                      ))}
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRequestDecryption}
                      disabled={isDecrypting}
                      className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-semibold rounded-xl transition-all disabled:opacity-50"
                    >
                      {isDecrypting ? 'Requesting...' : '🔓 Decrypt'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleManualRefresh}
                      className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 font-semibold rounded-xl transition-all"
                    >
                      <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                    </motion.button>
                  </div>

                  {autoRefresh && (
                    <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
                      🔄 Auto-refreshing data every 5 seconds... (Waiting for gateway callback)
                    </div>
                  )}

                  {isDecrypted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Blood Sugar</div>
                        <div className="text-2xl font-bold text-emerald-400">{bloodSugar} mg/dL</div>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Cholesterol</div>
                        <div className="text-2xl font-bold text-emerald-400">{cholesterol} mg/dL</div>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">BMI</div>
                        <div className="text-2xl font-bold text-emerald-400">{bmi}</div>
                      </div>
                      <div className="col-span-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-sm text-gray-400">Recorded On</div>
                          <div className="text-white font-semibold">
                            {timestamp ? new Date(timestamp * 1000).toLocaleString() : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                      <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <div className="text-lg font-bold text-yellow-300 mb-1">Record Encrypted</div>
                      <div className="text-sm text-gray-400">Click "Decrypt" and wait 30-60 seconds for gateway processing</div>
                    </div>
                  )}
                </div>
              )}

              {hasAccess && totalRecords === 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-30" />
                  <div className="text-lg font-bold text-gray-300 mb-1">No Records Available</div>
                  <div className="text-sm text-gray-400">This patient hasn't shared any health data yet</div>
                </div>
              )}
            </motion.div>
          )}

          {!searchedPatient && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Enter a patient address to access their health records</p>
            </div>
          )}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-2xl p-6 border border-emerald-500/20"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Research Access Model</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">
                Purchase one-time access to a patient's encrypted health data for {formatEther(RESEARCHER_ACCESS_FEE)} ETH. 
                The patient receives 80% of the payment ({formatEther(RESEARCHER_ACCESS_FEE * BigInt(80) / BigInt(100))} ETH) 
                and the platform receives a 20% fee.
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                All health records are encrypted on-chain. Decryption requests are processed by the Zama Gateway 
                and may take 30-60 seconds to complete. Use the Refresh button to check for updates.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResearcherPortal;
