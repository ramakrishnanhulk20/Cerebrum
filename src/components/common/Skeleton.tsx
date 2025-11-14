import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-xl';
      case 'rectangular':
      default:
        return 'rounded-md';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-shimmer bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]';
      case 'pulse':
        return 'animate-pulse bg-gray-800';
      case 'none':
      default:
        return 'bg-gray-800';
    }
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
    />
  );
};

// Skeleton Card Component
export const SkeletonCard = () => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" className="mb-2" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={100} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    </div>
  );
};

// Skeleton Table Row
export const SkeletonTableRow = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-800">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" className="mb-2" width="70%" />
        <Skeleton variant="text" width="50%" />
      </div>
      <Skeleton variant="rounded" width={100} height={32} />
    </div>
  );
};

// Skeleton Stats Grid
export const SkeletonStats = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 text-center"
        >
          <Skeleton variant="circular" width={40} height={40} className="mx-auto mb-4" />
          <Skeleton variant="text" width="60%" className="mx-auto mb-2" />
          <Skeleton variant="text" width="40%" className="mx-auto" />
        </motion.div>
      ))}
    </div>
  );
};

// Skeleton Dashboard
export const SkeletonDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Skeleton variant="text" height={48} className="mx-auto mb-4" width="50%" />
        <Skeleton variant="text" height={24} className="mx-auto" width="70%" />
      </div>

      {/* Stats */}
      <SkeletonStats count={3} />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
        <Skeleton variant="text" className="mb-4" width="30%" height={24} />
        <SkeletonTableRow />
        <SkeletonTableRow />
        <SkeletonTableRow />
      </div>
    </div>
  );
};

// Skeleton List
export const SkeletonList = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white/5 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1">
              <Skeleton variant="text" className="mb-2" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
            <Skeleton variant="rounded" width={80} height={32} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
