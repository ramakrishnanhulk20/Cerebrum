import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CopyButtonProps {
  text: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CopyButton = ({ 
  text, 
  label = 'Copy', 
  showLabel = false,
  className = '',
  size = 'md'
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4 p-1.5',
    md: 'w-5 h-5 p-2',
    lg: 'w-6 h-6 p-2.5',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-200 ${className}`}
      title={label}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            <Check className={sizeClasses[size]} />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className={sizeClasses[size]} />
          </motion.div>
        )}
      </AnimatePresence>
      {showLabel && <span className="text-sm">{copied ? 'Copied!' : label}</span>}
    </motion.button>
  );
};
