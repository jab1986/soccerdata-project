import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { shouldReduceMotion } from '../../utils/motionConfig';

// Filter panel slide-in animations
const filterPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -300,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    x: -300,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Mobile filter panel animations (slide from top)
const mobileFilterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: 'easeInOut',
    },
  },
};

// Filter item animations
const filterItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.1,
    },
  },
};

// Active filter badge animations
const badgeVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeInOut',
    },
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

interface AnimatedFilterPanelProps {
  children: React.ReactNode;
  isVisible: boolean;
  isMobile?: boolean;
  className?: string;
}

// Animated Filter Panel Component
export const AnimatedFilterPanel: React.FC<AnimatedFilterPanelProps> = ({
  children,
  isVisible,
  isMobile = false,
  className = '',
}) => {
  const reduceMotion = shouldReduceMotion();
  
  const variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : isMobile
    ? mobileFilterVariants
    : filterPanelVariants;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ willChange: reduceMotion ? 'auto' : 'transform, opacity' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface AnimatedFilterItemProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// Animated Filter Item Component
export const AnimatedFilterItem: React.FC<AnimatedFilterItemProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const reduceMotion = shouldReduceMotion();
  
  const variants: Variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: filterItemVariants.hidden,
        visible: {
          ...(filterItemVariants.visible as any),
          transition: {
            ...((filterItemVariants.visible as any).transition || {}),
            delay,
          },
        },
      };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      style={{ willChange: reduceMotion ? 'auto' : 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedFilterBadgeProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

// Animated Filter Badge Component
export const AnimatedFilterBadge: React.FC<AnimatedFilterBadgeProps> = ({
  children,
  isActive,
  onClick,
  className = '',
}) => {
  const reduceMotion = shouldReduceMotion();
  
  const variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : badgeVariants;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={className}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
          onClick={onClick}
          style={{ 
            willChange: reduceMotion ? 'auto' : 'transform, opacity',
            cursor: onClick ? 'pointer' : 'default',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Count animation for filter numbers
interface AnimatedCountProps {
  value: number;
  className?: string;
}

export const AnimatedCount: React.FC<AnimatedCountProps> = ({
  value,
  className = '',
}) => {
  const reduceMotion = shouldReduceMotion();

  if (reduceMotion) {
    return (
      <span key={value} className={className}>
        {value}
      </span>
    );
  }

  return (
    <motion.span
      key={value}
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {value}
    </motion.span>
  );
};

// Search input with focus animations
interface AnimatedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export const AnimatedSearchInput: React.FC<AnimatedSearchInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const reduceMotion = shouldReduceMotion();
  const [isFocused, setIsFocused] = React.useState(false);

  const inputVariants: Variants = {
    default: {
      scale: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    focused: {
      scale: reduceMotion ? 1 : 1.02,
      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <motion.input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      className={className}
      aria-label={ariaLabel}
      variants={inputVariants}
      animate={isFocused ? 'focused' : 'default'}
      style={{ willChange: reduceMotion ? 'auto' : 'transform, box-shadow' }}
    />
  );
};

export default {
  AnimatedFilterPanel,
  AnimatedFilterItem,
  AnimatedFilterBadge,
  AnimatedCount,
  AnimatedSearchInput,
};
