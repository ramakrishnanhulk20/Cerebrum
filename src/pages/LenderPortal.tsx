import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Shield, TrendingUp, Users, CheckCircle, XCircle, Lock, Unlock, DollarSign, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccount, useReadContract } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts';
import { isAddress } from 'viem';

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

const LenderPortal = () => {
  const { address, isConnected } = useAccount();
  const [patientAddress, setPatientAddress] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<string | null>(null);

  // Read total patients
  const { data: totalPatients } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getTotalPatients',
  });

  // Read patient info for searched address
  const { data: patientInfo, refetch: refetchPatient } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientInfo',
    args: searchedPatient ? [searchedPatient as `0x${string}`] : undefined,
  });

  // Check if lender has approval
  const { data: hasApproval } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'hasLenderApproval',
    args: searchedPatient && address ? [searchedPatient as `0x${string}`, address] : undefined,
  });

  const handleSearch = () => {
    if (!isAddress(patientAddress)) {
      toast.error('Invalid patient address');
      return;
    }

    setSearchedPatient(patientAddress);
    refetchPatient();
    toast.success('Patient lookup successful!');
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
          <p className="text-gray-400">Please connect your wallet to access the Lender Portal</p>
        </motion.div>
      </div>
    );
  }

  // Extract patient data
  const isRegistered = patientInfo?.[0] as boolean;
  const sharingEnabled = patientInfo?.[1] as boolean;
  const dataShareCount = patientInfo?.[4] ? Number(patientInfo[4]) : 0;
  const decryptedScore = patientInfo?.[5] ? Number(patientInfo[5]) : 0;
  const scoreDecrypted = patientInfo?.[6] as boolean;

  // Calculate qualification (score >= 650 is good)
  const isQualified = scoreDecrypted && decryptedScore >= 650;

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
                Lender Portal
              </h1>
              <p className="text-sm text-gray-400 font-mono">{address}</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <DollarSign className="w-12 h-12 text-emerald-400" />
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
            <Shield className="w-8 h-8 text-emerald-400 mb-3" />
            <div className="text-4xl font-bold text-emerald-400 mb-1">100%</div>
            <div className="text-sm text-gray-400">FHE Encrypted</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
            className="glass-strong rounded-2xl p-6"
          >
            <Activity className="w-8 h-8 text-emerald-400 mb-3" />
            <div className="text-4xl font-bold text-emerald-400 mb-1">
              {searchedPatient && hasApproval ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-400">Active Approvals</div>
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
              {isRegistered ? (
                <>
                  {/* Patient Info Card */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Patient Information</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        hasApproval 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                      }`}>
                        {hasApproval ? '✓ Approved' : '⏳ Pending Approval'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Address:</span>
                        <div className="text-white font-mono text-xs mt-1 break-all">{searchedPatient}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Data Shares:</span>
                        <div className="text-emerald-400 font-semibold mt-1">{dataShareCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Sharing Status:</span>
                        <div className={`mt-1 font-semibold ${sharingEnabled ? 'text-green-400' : 'text-red-400'}`}>
                          {sharingEnabled ? '✓ Enabled' : '✗ Disabled'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Registration:</span>
                        <div className="text-emerald-400 font-semibold mt-1">Verified</div>
                      </div>
                    </div>
                  </div>

                  {/* Health Score Card */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400 mr-2" />
                      Health Credit Score
                    </h3>

                    {hasApproval ? (
                      <>
                        {scoreDecrypted ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-5xl font-bold text-emerald-400 mb-2">
                                <AnimatedNumber value={decryptedScore} duration={1500} />
                              </div>
                              <div className="text-sm text-gray-400">Decrypted Score</div>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                              isQualified
                                ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                                : 'bg-red-500/20 text-red-300 border border-red-500/50'
                            }`}>
                              {isQualified ? '✓ Qualified' : '✗ Not Qualified'}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-yellow-400">
                            <Lock className="w-8 h-8" />
                            <div>
                              <div className="text-xl font-bold">Score Encrypted</div>
                              <div className="text-sm text-gray-400">Patient needs to decrypt their score</div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                        <XCircle className="w-6 h-6 text-red-400" />
                        <div>
                          <div className="text-red-300 font-semibold">No Access</div>
                          <div className="text-sm text-gray-400">Patient has not approved you as a lender</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score Breakdown */}
                  {hasApproval && scoreDecrypted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-6"
                    >
                      <h3 className="text-lg font-bold text-white mb-4">Score Analysis</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Base Score</span>
                          <span className="text-emerald-400 font-semibold">500</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Data Shares (+10 each)</span>
                          <span className="text-emerald-400 font-semibold">+{dataShareCount * 10}</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                          <span className="text-white font-bold">Total Score</span>
                          <span className="text-emerald-400 font-bold text-xl">{decryptedScore}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Qualification Checker */}
                  {hasApproval && scoreDecrypted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl p-6 border-2 ${
                        isQualified
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {isQualified ? (
                          <>
                            <CheckCircle className="w-12 h-12 text-green-400" />
                            <div>
                              <div className="text-xl font-bold text-green-300 mb-1">
                                ✓ Patient Qualifies for Loan
                              </div>
                              <div className="text-sm text-gray-300">
                                Score meets minimum requirement of 650 points
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-12 h-12 text-red-400" />
                            <div>
                              <div className="text-xl font-bold text-red-300 mb-1">
                                ✗ Patient Does Not Qualify
                              </div>
                              <div className="text-sm text-gray-300">
                                Score below minimum requirement of 650 points
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                  <XCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <div className="text-lg font-bold text-yellow-300 mb-1">Patient Not Registered</div>
                  <div className="text-sm text-gray-400">This address is not registered in the Cerebrum platform</div>
                </div>
              )}
            </motion.div>
          )}

          {!searchedPatient && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Enter a patient address to view their credit information</p>
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
            <Shield className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Privacy & Security</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                All patient health data is encrypted on-chain using Fully Homomorphic Encryption (FHE). 
                You can only view the credit score if the patient has approved you as a lender. 
                The score must be decrypted by the patient before it becomes visible.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LenderPortal;
