import React, { useState, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { shouldReduceMotion } from '../../utils/motionConfig';

// Button press feedback animation
const buttonPressVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

// Card hover interactions
const cardHoverVariants: Variants = {
  idle: {
    y: 0,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  hover: {
    y: -4,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  tap: {
    y: -2,
    scale: 0.99,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

// Removed unused variants - using simpler approach

interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'betting' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

// Enhanced Interactive Button with micro-interactions
export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'default',
  size = 'md',
}) => {
  const reduceMotion = shouldReduceMotion();
  const [isPressed, setIsPressed] = useState(false);
  
  const variantClasses = {
    default: 'bg-white text-gray-700 border border-gray-300',
    betting: 'bg-primary-red text-white border border-primary-red',
    success: 'bg-green-500 text-white border border-green-500',
    danger: 'bg-red-500 text-white border border-red-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const handlePress = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // Add haptic feedback for mobile devices
    if (navigator.vibrate && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) onClick();
  }, [disabled, onClick]);

  if (reduceMotion) {
    return (
      <button
        onClick={handlePress}
        disabled={disabled}
        className={`rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      onClick={handlePress}
      disabled={disabled}
      className={`rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      variants={buttonPressVariants}
      initial="idle"
      animate={isPressed ? 'tap' : 'idle'}
      whileHover={!disabled ? 'hover' : undefined}
      whileTap={!disabled ? 'tap' : undefined}
      style={{ willChange: 'transform, box-shadow' }}
    >
      {children}
    </motion.button>
  );
};

interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'fixture' | 'betting';
  interactive?: boolean;
}

// Enhanced Interactive Card with hover effects
export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  onClick,
  className = '',
  variant = 'default',
  interactive = true,
}) => {
  const reduceMotion = shouldReduceMotion();
  
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    fixture: 'bg-white border border-gray-200 hover:border-primary-yellow',
    betting: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-primary-red',
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  }, [onClick]);

  if (reduceMotion || !interactive) {
    return (
      <div
        onClick={onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        className={`rounded-lg p-4 transition-colors duration-150 ${variantClasses[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-pressed={onClick ? false : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={`rounded-lg p-4 ${variantClasses[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      variants={cardHoverVariants}
      initial="idle"
      whileHover={interactive ? 'hover' : undefined}
      whileTap={interactive && onClick ? 'tap' : undefined}
      style={{ willChange: 'transform, box-shadow' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? false : undefined}
    >
      {children}
    </motion.div>
  );
};

export default {
  InteractiveButton,
  InteractiveCard,
};
