import React from 'react';
import { motion, Variants, HTMLMotionProps } from 'framer-motion';

// Container animation variants for staggered children
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05, // Stagger each child by 50ms
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1, // Reverse order for exit
    },
  },
};

// Fast container for mobile devices (reduced stagger)
const mobileContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.03, // Faster stagger for mobile
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.01,
      staggerDirection: -1,
    },
  },
};

// Item animation variants
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

// Mobile-optimized item variants (reduced motion)
const mobileItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
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

// Loading skeleton variants
const skeletonVariants: Variants = {
  loading: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

interface AnimatedListProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: React.ReactNode;
  variant?: 'default' | 'mobile' | 'fast';
  loading?: boolean;
  loadingCount?: number; // Number of skeleton items to show
  className?: string;
  itemClassName?: string;
  reduceMotion?: boolean;
  onAnimationComplete?: () => void;
  staggerDelay?: number; // Custom stagger delay
}

// Individual animated item component
export const AnimatedListItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'mobile';
  reduceMotion?: boolean;
  index?: number; // For manual staggering
}> = ({ children, className = '', variant = 'default', reduceMotion = false, index }) => {
  const variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : variant === 'mobile'
    ? mobileItemVariants
    : itemVariants;

  return (
    <motion.div
      className={className}
      variants={variants}
      layout // Enable layout animations for reordering
      layoutId={index ? `list-item-${index}` : undefined}
      // Performance optimization
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

// Loading skeleton component
const LoadingSkeleton: React.FC<{ count: number; className?: string }> = ({
  count,
  className = '',
}) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <motion.div
        key={`skeleton-${index}`}
        className={`animate-pulse bg-gray-200 rounded-lg p-4 mb-3 ${className}`}
        variants={skeletonVariants}
        animate="loading"
      >
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      </motion.div>
    ))}
  </>
);

// Main animated list component
const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  variant = 'default',
  loading = false,
  loadingCount = 3,
  className = '',
  itemClassName = '',
  reduceMotion = false,
  onAnimationComplete,
  staggerDelay,
  ...props
}) => {
  // Select appropriate variants based on device and performance
  const getContainerVariants = (): Variants => {
    if (reduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    const baseVariants = variant === 'mobile' ? mobileContainerVariants : containerVariants;
    
    if (staggerDelay) {
      const visibleVariant = baseVariants.visible as any;
      return {
        ...baseVariants,
        visible: {
          ...visibleVariant,
          transition: {
            ...(visibleVariant.transition || {}),
            staggerChildren: staggerDelay,
          },
        },
      };
    }

    return baseVariants;
  };

  const containerVars = getContainerVariants();

  // Auto-wrap children in AnimatedListItem if they aren't already
  const processChildren = (children: React.ReactNode) => {
    return React.Children.map(children, (child, index) => {
      // If child is already an AnimatedListItem, return as-is
      if (React.isValidElement(child) && child.type === AnimatedListItem) {
        return child;
      }

      // Wrap in AnimatedListItem
      return (
        <AnimatedListItem
          key={index}
          className={itemClassName}
          variant={variant === 'mobile' ? 'mobile' : 'default'}
          reduceMotion={reduceMotion}
          index={index}
        >
          {child}
        </AnimatedListItem>
      );
    });
  };

  return (
    <motion.div
      className={className}
      variants={containerVars}
      initial="hidden"
      animate="visible"
      exit="exit"
      onAnimationComplete={onAnimationComplete}
      // Performance optimization
      style={{ willChange: reduceMotion ? 'auto' : 'transform, opacity' }}
      {...props}
    >
      {loading ? (
        <LoadingSkeleton count={loadingCount} className={itemClassName} />
      ) : (
        processChildren(children)
      )}
    </motion.div>
  );
};

// Betting Club specific list variants
export const FixtureAnimatedList: React.FC<Omit<AnimatedListProps, 'variant'>> = (props) => (
  <AnimatedList variant="default" staggerDelay={0.04} {...props} />
);

export const MobileFixtureList: React.FC<Omit<AnimatedListProps, 'variant'>> = (props) => (
  <AnimatedList variant="mobile" staggerDelay={0.02} {...props} />
);

export const FastAnimatedList: React.FC<Omit<AnimatedListProps, 'variant'>> = (props) => (
  <AnimatedList variant="fast" staggerDelay={0.01} {...props} />
);

export default AnimatedList;
