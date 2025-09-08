import React from 'react';
import { motion, Variants } from 'framer-motion';
import { shouldReduceMotion } from '../../utils/motionConfig';

// Spinner variants for different loading states
const spinnerVariants: Variants = {
  loading: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Pulse animation for loading content
const pulseVariants: Variants = {
  loading: {
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.02, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Skeleton loading animation
const skeletonVariants: Variants = {
  loading: {
    backgroundColor: ['#f3f4f6', '#e5e7eb', '#f3f4f6'],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Bounce loading for dots
const bounceVariants: Variants = {
  loading: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Wave animation for multiple elements - using direct animation instead of variants
const getWaveAnimation = (index: number) => ({
  y: [0, -8, 0],
  transition: {
    duration: 0.8,
    repeat: Infinity,
    ease: 'easeInOut' as const,
    delay: index * 0.1,
  },
});

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

// Loading Spinner Component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const reduceMotion = shouldReduceMotion();
  
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };
  
  const colorClasses = {
    primary: 'border-primary-red border-t-transparent',
    secondary: 'border-gray-400 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  if (reduceMotion) {
    return (
      <div className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
        <div className="sr-only">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      variants={spinnerVariants}
      animate="loading"
      style={{ willChange: 'transform' }}
    >
      <div className="sr-only">Loading...</div>
    </motion.div>
  );
};

interface LoadingDotsProps {
  count?: number;
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

// Loading Dots Component
export const LoadingDots: React.FC<LoadingDotsProps> = ({
  count = 3,
  color = 'primary',
  className = '',
}) => {
  const reduceMotion = shouldReduceMotion();
  
  const colorClasses = {
    primary: 'bg-primary-red',
    secondary: 'bg-gray-400',
    white: 'bg-white',
  };

  const dots = Array.from({ length: count }, (_, i) => i);

  if (reduceMotion) {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {dots.map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${colorClasses[color]}`}
          />
        ))}
        <div className="sr-only">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`flex space-x-1 ${className}`}>
      {dots.map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${colorClasses[color]}`}
          variants={bounceVariants}
          animate="loading"
          custom={i}
          style={{ willChange: 'transform' }}
        />
      ))}
      <div className="sr-only">Loading...</div>
    </div>
  );
};

interface LoadingWaveProps {
  count?: number;
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

// Loading Wave Component
export const LoadingWave: React.FC<LoadingWaveProps> = ({
  count = 5,
  color = 'primary',
  className = '',
}) => {
  const reduceMotion = shouldReduceMotion();
  
  const colorClasses = {
    primary: 'bg-primary-red',
    secondary: 'bg-gray-400',
    white: 'bg-white',
  };

  const bars = Array.from({ length: count }, (_, i) => i);

  if (reduceMotion) {
    return (
      <div className={`flex items-end space-x-1 ${className}`}>
        {bars.map((i) => (
          <div
            key={i}
            className={`w-1 bg-opacity-60 ${colorClasses[color]}`}
            style={{ 
              height: `${Math.random() * 16 + 8}px`
            }}
          />
        ))}
        <div className="sr-only">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`flex items-end space-x-1 ${className}`}>
      {bars.map((i) => (
        <motion.div
          key={i}
          className={`w-1 h-4 ${colorClasses[color]}`}
          animate={getWaveAnimation(i)}
          style={{ willChange: 'transform' }}
        />
      ))}
      <div className="sr-only">Loading...</div>
    </div>
  );
};

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  avatarSize?: 'sm' | 'md' | 'lg' | null;
}

// Loading Skeleton Component for card layouts
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  className = '',
  avatarSize = null,
}) => {
  const reduceMotion = shouldReduceMotion();
  
  const avatarSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const lineHeights = ['h-4', 'h-3', 'h-3', 'h-3'];
  const lineWidths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6'];

  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex space-x-3">
        {avatarSize && (
          <motion.div
            className={`${avatarSizes[avatarSize]} bg-gray-300 rounded-full flex-shrink-0`}
            variants={reduceMotion ? {} : skeletonVariants}
            animate={reduceMotion ? false : 'loading'}
          />
        )}
        
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }, (_, i) => (
            <motion.div
              key={i}
              className={`${lineHeights[i] || 'h-3'} ${lineWidths[i] || 'w-2/3'} bg-gray-300 rounded`}
              variants={reduceMotion ? {} : skeletonVariants}
              animate={reduceMotion ? false : 'loading'}
              style={{ willChange: reduceMotion ? 'auto' : 'background-color' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface LoadingCardProps {
  count?: number;
  className?: string;
  showAvatar?: boolean;
}

// Loading Card Component for fixture cards
export const LoadingCard: React.FC<LoadingCardProps> = ({
  count = 1,
  className = '',
  showAvatar = false,
}) => {
  const cards = Array.from({ length: count }, (_, i) => i);
  
  return (
    <>
      {cards.map((i) => (
        <div
          key={i}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mobile:p-5 ${className}`}
        >
          <LoadingSkeleton 
            lines={3} 
            avatarSize={showAvatar ? 'md' : null}
            className="mb-3"
          />
          
          <div className="flex items-center justify-between">
            <LoadingSkeleton lines={1} className="w-24" />
            <LoadingSkeleton lines={1} className="w-16" />
          </div>
        </div>
      ))}
    </>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: 'spinner' | 'dots' | 'wave';
  className?: string;
}

// Loading Overlay Component for full-page loading
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  variant = 'spinner',
  className = '',
}) => {
  if (!isVisible) return null;

  const LoadingComponent = {
    spinner: LoadingSpinner,
    dots: LoadingDots,
    wave: LoadingWave,
  }[variant];

  return (
    <motion.div
      className={`fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <LoadingComponent size="lg" color="primary" />
        </div>
        
        <motion.p
          className="text-gray-600 font-medium"
          variants={pulseVariants}
          animate="loading"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
};

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Loading Button Component
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  className = '',
  onClick,
  disabled = false,
}) => {
  const reduceMotion = shouldReduceMotion();

  return (
    <motion.button
      className={`inline-flex items-center justify-center ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={!reduceMotion && !disabled && !isLoading ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 17 }}
    >
      {isLoading && (
        <LoadingSpinner size="sm" color="white" className="mr-2" />
      )}
      
      <motion.span
        key={isLoading ? 'loading' : 'default'}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isLoading ? loadingText : children}
      </motion.span>
    </motion.button>
  );
};

export default {
  LoadingSpinner,
  LoadingDots,
  LoadingWave,
  LoadingSkeleton,
  LoadingCard,
  LoadingOverlay,
  LoadingButton,
};
