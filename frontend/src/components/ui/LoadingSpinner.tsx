import React from 'react';
import { motion } from 'framer-motion';

// Define spinner animation variants
const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

const fadeInVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// LoadingSpinner component props interface
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'white' | 'gray';
  'aria-label'?: string;
}

// LoadingSpinner component with betting club styling and accessibility
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'primary',
  'aria-label': ariaLabel = 'Loading'
}) => {
  // Size styles with responsive design
  const sizeStyles = {
    sm: 'h-4 w-4 mobile:h-5 mobile:w-5',
    md: 'h-6 w-6 mobile:h-7 mobile:w-7',
    lg: 'h-8 w-8 mobile:h-9 mobile:w-9'
  };

  // Color styles using betting club colors
  const colorStyles = {
    primary: 'border-primary-red',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  // Base styles with smooth animation
  const baseStyles = 'rounded-full border-2 border-solid border-t-transparent';

  // Combine all styles
  const spinnerStyles = `${baseStyles} ${sizeStyles[size]} ${colorStyles[color]} ${className}`;

  return (
    <motion.div
      className={spinnerStyles}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      variants={spinnerVariants}
      animate="animate"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ opacity: { duration: 0.2 } }}
    >
      <span className="sr-only">{ariaLabel}</span>
    </motion.div>
  );
};

// Overlay LoadingSpinner for full-screen loading
interface LoadingOverlayProps {
  visible: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  size = 'lg',
  message = 'Loading...',
  className = ''
}) => {
  if (!visible) return null;

  return (
    <motion.div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm ${className}`}
      variants={fadeInVariants}
      initial="hidden"
      animate={visible ? "visible" : "exit"}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-betting p-6 mobile:p-8 flex flex-col items-center space-y-4 mobile:space-y-5 max-w-sm mx-4"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <LoadingSpinner size={size} color="primary" aria-label={message} />
        {message && (
          <motion.p 
            className="text-fluid-base font-medium text-gray-900 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

// Inline LoadingSpinner for buttons and small spaces
interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  'aria-label'?: string;
}

const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'sm',
  color = 'primary',
  className = '',
  'aria-label': ariaLabel = 'Loading'
}) => {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <LoadingSpinner 
        size={size} 
        color={color} 
        aria-label={ariaLabel}
        className="mr-2 mobile:mr-3"
      />
      <span className="text-fluid-sm">{ariaLabel}</span>
    </span>
  );
};

// Content LoadingSpinner for content areas
interface ContentLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const ContentLoading: React.FC<ContentLoadingProps> = ({
  size = 'md',
  message = 'Loading content...',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-8 mobile:py-12 space-y-3 mobile:space-y-4 ${className}`}>
      <LoadingSpinner size={size} color="primary" aria-label={message} />
      {message && (
        <p className="text-fluid-sm text-gray-500 text-center max-w-sm">
          {message}
        </p>
      )}
    </div>
  );
};

// Betting Club themed loading messages
interface BettingLoadingProps {
  type?: 'fixtures' | 'results' | 'export' | 'general';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BettingLoading: React.FC<BettingLoadingProps> = ({
  type = 'general',
  size = 'md',
  className = ''
}) => {
  const messages = {
    fixtures: 'Loading fixture data...',
    results: 'Updating match results...',
    export: 'Preparing your betting data...',
    general: 'Loading...'
  };

  const icons = {
    fixtures: '⚽',
    results: '🏆',
    export: '📥',
    general: '🎯'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 mobile:py-12 space-y-4 mobile:space-y-5 ${className}`}>
      <div className="text-4xl mobile:text-5xl animate-bounce">
        {icons[type]}
      </div>
      <LoadingSpinner size={size} color="primary" aria-label={messages[type]} />
      <p className="text-fluid-base font-medium text-gray-900 text-center">
        {messages[type]}
      </p>
      <p className="text-fluid-sm text-gray-500 text-center max-w-sm">
        <span className="text-primary-yellow">Super Cool</span> Betting Club
      </p>
    </div>
  );
};

// Export LoadingSpinner with its variants
// Use type assertion to allow attaching static properties
(LoadingSpinner as any).Overlay = LoadingOverlay;
(LoadingSpinner as any).Inline = InlineLoading;
(LoadingSpinner as any).Content = ContentLoading;
(LoadingSpinner as any).Betting = BettingLoading;

export default LoadingSpinner;
export { LoadingOverlay, InlineLoading, ContentLoading, BettingLoading };
export type { 
  LoadingSpinnerProps, 
  LoadingOverlayProps, 
  InlineLoadingProps, 
  ContentLoadingProps,
  BettingLoadingProps 
};
