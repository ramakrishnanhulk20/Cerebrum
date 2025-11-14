import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'blue' | 'yellow' | 'red';
  className?: string;
}

export const ProgressBar = ({
  value,
  max = 100,
  showLabel = true,
  label,
  size = 'md',
  color = 'emerald',
  className = '',
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    emerald: 'from-emerald-600 to-green-600',
    blue: 'from-blue-600 to-cyan-600',
    yellow: 'from-yellow-600 to-orange-600',
    red: 'from-red-600 to-pink-600',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showLabel && (
            <span className="text-sm font-semibold text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`${sizeClasses[size]} bg-gradient-to-r ${colorClasses[color]} rounded-full`}
        />
      </div>
    </div>
  );
};

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  color?: string;
  className?: string;
}

export const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  color = '#00e6a0',
  className = '',
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {showValue && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-white">{Math.round(value)}%</span>
        </motion.div>
      )}
    </div>
  );
};

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
  className?: string;
}

export const StepProgress = ({
  currentStep,
  totalSteps,
  steps = [],
  className = '',
}: StepProgressProps) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const stepLabel = steps[index];

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 border-white/20 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNumber}
                </motion.div>
                {stepLabel && (
                  <span
                    className={`mt-2 text-xs text-center ${
                      isCurrent ? 'text-emerald-400 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {stepLabel}
                  </span>
                )}
              </div>

              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ProfileCompletionProps {
  completedSteps: string[];
  totalSteps: string[];
  className?: string;
}

export const ProfileCompletion = ({
  completedSteps,
  totalSteps,
  className = '',
}: ProfileCompletionProps) => {
  const percentage = (completedSteps.length / totalSteps.length) * 100;

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
        <span className="text-2xl font-bold text-emerald-400">{Math.round(percentage)}%</span>
      </div>
      
      <ProgressBar value={percentage} showLabel={false} size="lg" />
      
      <div className="mt-4 space-y-2">
        {totalSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(step);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-gray-500'
                }`}
              >
                {isCompleted ? '✓' : ''}
              </div>
              <span className={isCompleted ? 'text-white' : 'text-gray-400'}>
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
