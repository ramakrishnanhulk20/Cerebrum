import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
  target?: string; // CSS selector for highlighting
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
  storageKey?: string;
}

export const OnboardingTour = ({
  steps,
  onComplete,
  onSkip,
  storageKey = 'onboarding_completed',
}: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      setTimeout(() => setShowTour(true), 1000); // Show after 1 second
    }
  }, [storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setShowTour(false);
    // Celebration effect
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setShowTour(false);
    onSkip();
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!showTour) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Tour Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border-2 border-emerald-500/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
        >
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Skip Tour
              </button>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-emerald-600 to-green-600 rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Icon */}
          {currentStepData.icon && (
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full p-6">
                {currentStepData.icon}
              </div>
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              {currentStepData.title}
            </h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              {currentStepData.description}
            </p>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed text-gray-500'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-emerald-500'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/30"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-4 h-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to check if onboarding is needed
export const useOnboarding = (storageKey: string = 'onboarding_completed') => {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    setNeedsOnboarding(!completed);
  }, [storageKey]);

  const markComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setNeedsOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(storageKey);
    setNeedsOnboarding(true);
  };

  return { needsOnboarding, markComplete, resetOnboarding };
};
