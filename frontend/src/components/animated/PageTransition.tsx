import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Page transition animation variants
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 1.05,
    y: -20,
  },
};

// Mobile-optimized page transitions (reduced motion for better performance)
const mobilePageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
};

// Slide transition for mobile navigation
const slideVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  in: {
    x: 0,
    opacity: 1,
  },
  out: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string; // Unique key for each page/section
  variant?: 'default' | 'slide' | 'mobile';
  direction?: number; // For slide transitions: 1 for next, -1 for previous
  className?: string;
  duration?: number;
  reduceMotion?: boolean; // Respect user's motion preferences
}

// Page transition wrapper component
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
  variant = 'default',
  direction = 1,
  className = '',
  duration = 0.3,
  reduceMotion = false,
}) => {
  // Choose appropriate variants based on device and preferences
  const getVariants = (): Variants => {
    if (reduceMotion) {
      return {
        initial: { opacity: 0 },
        in: { opacity: 1 },
        out: { opacity: 0 },
      };
    }

    switch (variant) {
      case 'slide':
        return slideVariants;
      case 'mobile':
        return mobilePageVariants;
      default:
        return pageVariants;
    }
  };

  const variants = getVariants();

  // Optimized transition settings
  const transition = {
    type: 'tween' as const,
    ease: [0.25, 0.1, 0.25, 1] as const, // Custom easing for smooth motion
    duration: reduceMotion ? 0.15 : duration,
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        className={`${className}`}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="in"
        exit="out"
        transition={transition}
        // Accessibility: Announce page changes
        role="main"
        aria-live="polite"
        // Performance optimizations
        style={{ willChange: 'transform, opacity' }}
        onAnimationComplete={() => {
          // Clean up will-change after animation
          const element = document.querySelector(`[data-page-key="${pageKey}"]`);
          if (element) {
            (element as HTMLElement).style.willChange = 'auto';
          }
        }}
        data-page-key={pageKey}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Higher-order component for easy page wrapping
export const withPageTransition = <P extends object>(
  Component: React.ComponentType<P>,
  pageKey: string,
  options?: Partial<PageTransitionProps>
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <PageTransition pageKey={pageKey} {...options}>
      <Component {...props} />
    </PageTransition>
  );

  WrappedComponent.displayName = `withPageTransition(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Betting Club specific page transitions
export const BettingPageTransition: React.FC<Omit<PageTransitionProps, 'variant'>> = (props) => (
  <PageTransition 
    variant="default" 
    duration={0.25}
    {...props}
  />
);

export const MobileBettingTransition: React.FC<Omit<PageTransitionProps, 'variant'>> = (props) => (
  <PageTransition 
    variant="mobile" 
    duration={0.2}
    {...props}
  />
);

export default PageTransition;
