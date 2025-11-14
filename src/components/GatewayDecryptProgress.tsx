import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Loader, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface GatewayDecryptProgressProps {
  isDecrypting: boolean;
  onDecrypt: () => void;
  disabled?: boolean;
  scoreDecrypted?: boolean;
  decryptedScore?: number;
}

const statusMessages = [
  { time: 0, message: "🔐 Initiating secure decryption...", icon: Shield },
  { time: 5, message: "📡 Connecting to Zama Gateway Oracle...", icon: Zap },
  { time: 10, message: "🔍 Gateway nodes processing request...", icon: Shield },
  { time: 20, message: "🔓 KMS verifying permissions...", icon: Loader },
  { time: 30, message: "⚡ Decryption in progress...", icon: Zap },
  { time: 40, message: "🛡️ Almost there! Finalizing...", icon: Shield },
  { time: 50, message: "✨ Preparing to reveal your score...", icon: CheckCircle },
];

export const GatewayDecryptProgress = ({
  isDecrypting,
  onDecrypt,
  disabled,
  scoreDecrypted,
  decryptedScore,
}: GatewayDecryptProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(statusMessages[0]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset state when decryption starts
  useEffect(() => {
    if (isDecrypting) {
      setProgress(0);
      setElapsedTime(0);
      setCurrentMessage(statusMessages[0]);
      setShowSuccess(false);
    }
  }, [isDecrypting]);

  // Animated progress bar
  useEffect(() => {
    if (!isDecrypting) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1;
        
        // Update progress (asymptotic approach to 95%, final 5% on actual completion)
        // This creates a smooth slowing effect that looks natural
        const progressPercent = Math.min(95, 10 + (85 * newTime) / 60);
        setProgress(progressPercent);
        
        // Update status message based on elapsed time
        for (let i = statusMessages.length - 1; i >= 0; i--) {
          if (newTime >= statusMessages[i].time) {
            setCurrentMessage(statusMessages[i]);
            break;
          }
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isDecrypting]);

  // Show success animation when decrypt completes
  useEffect(() => {
    if (!isDecrypting && elapsedTime > 0 && scoreDecrypted) {
      setProgress(100);
      setShowSuccess(true);
      setCurrentMessage({ 
        time: 60, 
        message: "✅ Score decrypted successfully!", 
        icon: CheckCircle 
      });
    }
  }, [isDecrypting, scoreDecrypted, elapsedTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedRemaining = Math.max(0, 45 - elapsedTime); // Estimate 45s average

  return (
    <div className="space-y-4">
      {/* Main Decrypt Button */}
      {!isDecrypting && !showSuccess && (
        <motion.button
          onClick={onDecrypt}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <Shield className="w-5 h-5" />
          <span>Gateway Decrypt (30-60s)</span>
        </motion.button>
      )}

      {/* Progress Animation */}
      <AnimatePresence>
        {(isDecrypting || showSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl"
          >
            {/* Status Message */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: isDecrypting ? 360 : 0 }}
                transition={{ 
                  duration: 2, 
                  repeat: isDecrypting ? Infinity : 0,
                  ease: "linear" 
                }}
              >
                <currentMessage.icon 
                  className={`w-6 h-6 ${showSuccess ? 'text-green-400' : 'text-emerald-400'}`} 
                />
              </motion.div>
              <div className="flex-1">
                <motion.p
                  key={currentMessage.message}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`font-semibold ${showSuccess ? 'text-green-400' : 'text-emerald-300'}`}
                >
                  {currentMessage.message}
                </motion.p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-4">
              <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`h-full rounded-full ${
                    showSuccess 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-emerald-500 to-green-500'
                  } relative`}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    animate={{
                      x: ['0%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: isDecrypting ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
              
              {/* Progress percentage */}
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>{Math.round(progress)}%</span>
                <span className="text-emerald-400 font-semibold">
                  {showSuccess ? '✓ Complete' : `~${estimatedRemaining}s remaining`}
                </span>
              </div>
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-between bg-black/30 rounded-xl p-3 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: isDecrypting ? Infinity : 0 }}
                >
                  {isDecrypting ? (
                    <Loader className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </motion.div>
                <span className="text-sm text-gray-300">Elapsed Time:</span>
              </div>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {formatTime(elapsedTime)}
              </span>
            </div>

            {/* Success Score Reveal */}
            {showSuccess && decryptedScore !== undefined && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mt-4 text-center"
              >
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-2xl p-6">
                  <p className="text-sm text-gray-300 mb-2">Your Health Credit Score</p>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                    className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                  >
                    {decryptedScore}
                  </motion.div>
                  <p className="text-xs text-gray-400 mt-2">
                    Decrypted via Gateway Oracle in {formatTime(elapsedTime)}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Info Footer */}
            {isDecrypting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4 flex items-start gap-2 text-xs text-gray-400 bg-black/30 rounded-lg p-3 border border-emerald-500/10"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <p>
                  <strong className="text-emerald-300">Gateway Oracle Mode:</strong> Your encrypted score is being processed 
                  by Zama's decentralized oracle network. This ensures maximum security and decentralization. 
                  The process typically takes 30-60 seconds.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success State - New Decrypt Button */}
      {showSuccess && scoreDecrypted && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setShowSuccess(false);
            setProgress(0);
            setElapsedTime(0);
            onDecrypt();
          }}
          className="w-full px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-emerald-500/30"
        >
          <Shield className="w-4 h-4" />
          <span>Decrypt Again</span>
        </motion.button>
      )}
    </div>
  );
};
