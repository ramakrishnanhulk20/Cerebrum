import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Activity, Award, DollarSign, Lock, Unlock, TrendingUp, Clock, CheckCircle, Users, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts';
import { formatEther, parseEther, isAddress } from 'viem';
import confetti from 'canvas-confetti';

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
    colors: ['#10b981', '#34d399', '#22c55e', '#6ee7b7'],
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

// Green Wave Effect
const GreenWave = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)',
        transformOrigin: 'left',
      }}
    />
  );
};

// Particle Burst
const ParticleBurst = ({ x, y, show }: { x: number; y: number; show: boolean }) => {
  if (!show) return null;

  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((i * 360) / 12 * Math.PI / 180) * 100,
            y: Math.sin((i * 360) / 12 * Math.PI / 180) * 100,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-2 h-2 bg-emerald-400 rounded-full"
        />
      ))}
    </div>
  );
};

// Progress Bar
const TransactionProgress = ({ show, progress }: { show: boolean; progress: number }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-8 right-8 glass-strong rounded-xl p-4 min-w-[300px] z-50"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">Processing Transaction</span>
        <span className="text-xs text-emerald-400">{progress}/12 blocks</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(progress / 12) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
        />
      </div>
    </motion.div>
  );
};

const PatientDashboard = () => {
  const { address, isConnected } = useAccount();
  const [bloodSugar, setBloodSugar] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [bmi, setBmi] = useState('');
  const [lenderAddress, setLenderAddress] = useState('');
  const [showWave, setShowWave] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [burstPos, setBurstPos] = useState({ x: 0, y: 0 });
  const [txProgress, setTxProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // Read patient data - CORRECT MAPPING
  const { data: patientInfo, refetch: refetchPatient } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getPatientInfo',
    args: address ? [address] : undefined,
  });

  // Write functions
  const { writeContract: register, data: registerHash } = useWriteContract();
  const { writeContract: shareData, data: shareHash } = useWriteContract();
  const { writeContract: toggleSharing, data: toggleHash } = useWriteContract();
  const { writeContract: approveLender, data: approveHash } = useWriteContract();
  const { writeContract: requestDecryption, data: decryptHash } = useWriteContract();
  const { writeContract: claimEarnings, data: claimHash } = useWriteContract();

  const { isLoading: isRegistering, isSuccess: registerSuccess } = useWaitForTransactionReceipt({ hash: registerHash });
  const { isLoading: isSharing, isSuccess: shareSuccess } = useWaitForTransactionReceipt({ hash: shareHash });
  const { isLoading: isToggling, isSuccess: toggleSuccess } = useWaitForTransactionReceipt({ hash: toggleHash });
  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDecrypting, isSuccess: decryptSuccess } = useWaitForTransactionReceipt({ hash: decryptHash });
  const { isLoading: isClaiming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  // Success effects
  useEffect(() => {
    if (shareSuccess) {
      triggerConfetti();
      setShowWave(true);
      setTimeout(() => setShowWave(false), 1500);
      toast.success('🎉 Health data shared! +10 points to your score!');
      refetchPatient();
    }
  }, [shareSuccess]);

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
    if (toggleSuccess) {
      toast.success('Data sharing preference updated!');
      refetchPatient();
    }
  }, [toggleSuccess]);

  useEffect(() => {
    if (approveSuccess) {
      toast.success('✅ Lender approved successfully!');
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (decryptSuccess) {
      toast.success('🔓 Score decryption requested! Gateway will process it.');
      setTimeout(() => refetchPatient(), 3000);
    }
  }, [decryptSuccess]);

  // Simulate transaction progress
  useEffect(() => {
    if (isSharing || isRegistering || isClaiming) {
      setShowProgress(true);
      setTxProgress(0);
      const interval = setInterval(() => {
        setTxProgress((prev) => {
          if (prev >= 12) {
            clearInterval(interval);
            setShowProgress(false);
            return 12;
          }
          return prev + 1;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isSharing, isRegistering, isClaiming]);

  const handleRegister = async () => {
    try {
      await register({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'registerPatient',
      });
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  const handleShareData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger particle burst
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    setBurstPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 800);

    try {
      await shareData({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'shareHealthData',
        args: [BigInt(bloodSugar), BigInt(cholesterol), BigInt(bmi)],
      });
      setBloodSugar('');
      setCholesterol('');
      setBmi('');
    } catch (error) {
      toast.error('Failed to share data');
    }
  };

  const handleToggleSharing = async (enabled: boolean) => {
    try {
      await toggleSharing({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'toggleDataSharing',
        args: [enabled],
      });
    } catch (error) {
      toast.error('Failed to toggle sharing');
    }
  };

  const handleApproveLender = async () => {
    if (!isAddress(lenderAddress)) {
      toast.error('Invalid lender address');
      return;
    }

    try {
      await approveLender({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'approveLender',
        args: [lenderAddress as `0x${string}`],
      });
      setLenderAddress('');
    } catch (error) {
      toast.error('Failed to approve lender');
    }
  };

  const handleRequestDecryption = async () => {
    try {
      await requestDecryption({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'requestScoreDecryption',
      });
    } catch (error) {
      toast.error('Failed to request decryption');
    }
  };

  const handleClaimEarnings = async () => {
    try {
      await claimEarnings({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'claimEarnings',
      });
    } catch (error) {
      toast.error('Failed to claim earnings');
    }
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
          <p className="text-gray-400">Please connect your wallet to access the Patient Dashboard</p>
        </motion.div>
      </div>
    );
  }

  // CORRECT DATA EXTRACTION FROM CONTRACT
  const isRegistered = patientInfo?.[0] as boolean;
  const sharingEnabled = patientInfo?.[1] as boolean;
  const lastDataShare = patientInfo?.[2] ? Number(patientInfo[2]) : 0;
  const registrationTime = patientInfo?.[3] ? Number(patientInfo[3]) : 0;
  const dataShareCount = patientInfo?.[4] ? Number(patientInfo[4]) : 0;
  const decryptedScore = patientInfo?.[5] ? Number(patientInfo[5]) : 0;
  const scoreDecrypted = patientInfo?.[6] as boolean;
  const totalEarnings = patientInfo?.[7] ? patientInfo[7] as bigint : BigInt(0);

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 flex items-center justify-center p-6">
        <GreenWave show={showWave} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-strong rounded-3xl p-12 text-center max-w-lg"
        >
          <Award className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Welcome to Cerebrum
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Register as a patient to start building your health credit score with full encryption.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRegister}
            disabled={isRegistering}
            className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
              <span className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Registering...
              </span>
            ) : (
              'Register Now'
            )}
          </motion.button>
        </motion.div>
        <TransactionProgress show={showProgress} progress={txProgress} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 p-6">
      <GreenWave show={showWave} />
      <ParticleBurst {...burstPos} show={showBurst} />
      <TransactionProgress show={showProgress} progress={txProgress} />

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
                Patient Dashboard
              </h1>
              <p className="text-sm text-gray-400 font-mono">{address}</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award className="w-12 h-12 text-emerald-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Credit Score Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
            className="glass-strong rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              {scoreDecrypted ? (
                <Eye className="w-5 h-5 text-emerald-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-yellow-400" />
              )}
            </div>
            
            {scoreDecrypted ? (
              <>
                <div className="text-4xl font-bold text-emerald-400 mb-1">
                  <AnimatedNumber value={decryptedScore} />
                </div>
                <div className="text-sm text-gray-400 mb-2">Health Credit Score (Decrypted)</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-400 mb-1 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Encrypted
                </div>
                <div className="text-sm text-gray-400 mb-2">Health Credit Score</div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRequestDecryption}
                  disabled={isDecrypting}
                  className="mt-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-semibold rounded-lg transition-all"
                >
                  {isDecrypting ? 'Requesting...' : '🔓 Decrypt Score'}
                </motion.button>
              </>
            )}
            <div className="text-xs text-emerald-400 mt-2">Score updated on-chain</div>
          </motion.div>

          {/* Total Earnings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
            className="glass-strong rounded-2xl p-6"
          >
            <DollarSign className="w-8 h-8 text-emerald-400 mb-3" />
            <div className="text-4xl font-bold text-emerald-400 mb-1">
              {formatEther(totalEarnings)}
            </div>
            <div className="text-sm text-gray-400">Total Earnings (ETH)</div>
            <div className="text-xs text-emerald-400 mt-1">From data sharing</div>
          </motion.div>

          {/* Data Shares */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
            className="glass-strong rounded-2xl p-6"
          >
            <Activity className="w-8 h-8 text-emerald-400 mb-3" />
            <div className="text-4xl font-bold text-emerald-400 mb-1">
              <AnimatedNumber value={dataShareCount} />
            </div>
            <div className="text-sm text-gray-400">Data Shares</div>
            <div className="text-xs text-emerald-400 mt-1">+10 points per share</div>
          </motion.div>
        </div>

        {/* Share Health Data Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Activity className="w-6 h-6 text-emerald-400 mr-2" />
            Share Health Data
          </h2>

          <form onSubmit={handleShareData} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="number"
                placeholder="Blood Sugar (mg/dL)"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                required
                className="input-base"
              />
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="number"
                placeholder="Cholesterol (mg/dL)"
                value={cholesterol}
                onChange={(e) => setCholesterol(e.target.value)}
                required
                className="input-base"
              />
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="number"
                placeholder="BMI"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                required
                className="input-base"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!sharingEnabled || isSharing}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? 'Sharing...' : `Share Data & Earn ${formatEther(DATA_SHARE_REWARD)} ETH`}
            </motion.button>

            {!sharingEnabled && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4" />
                <span>Enable data sharing below to start earning rewards</span>
              </div>
            )}
          </form>

          {/* Data Sharing Toggle */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Data Sharing Status</h3>
                <p className="text-sm text-gray-400">
                  {sharingEnabled ? `✓ Enabled. You earn ${formatEther(DATA_SHARE_REWARD)} ETH per share.` : '✗ Disabled. Enable to start earning.'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleSharing(!sharingEnabled)}
                disabled={isToggling}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  sharingEnabled
                    ? 'bg-green-500/20 text-green-300 border-2 border-green-500/50'
                    : 'bg-red-500/20 text-red-300 border-2 border-red-500/50'
                }`}
              >
                {sharingEnabled ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                {isToggling ? 'Updating...' : (sharingEnabled ? 'Enabled' : 'Disabled')}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Approve Lender */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Users className="w-6 h-6 text-emerald-400 mr-2" />
            Grant Lender Access
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            ℹ️ Your address for lenders to approve: <span className="text-emerald-400 font-mono">{address}</span>
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Lender Address (0x...)"
              value={lenderAddress}
              onChange={(e) => setLenderAddress(e.target.value)}
              className="flex-1 input-base"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApproveLender}
              disabled={isApproving}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl"
            >
              {isApproving ? 'Approving...' : 'Approve'}
            </motion.button>
          </div>
        </motion.div>

        {/* Claim Earnings */}
        {totalEarnings > BigInt(0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-6 border-2 border-emerald-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-1">
                  Earnings Available: {formatEther(totalEarnings)} ETH
                </h3>
                <p className="text-sm text-gray-400">Click to claim your rewards</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimEarnings}
                disabled={isClaiming}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/50"
              >
                {isClaiming ? 'Claiming...' : 'Claim Now'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
