import { Variants, Transition } from 'framer-motion';

// Motion configuration for consistent animations across the betting club app
export const motionConfig = {
  // Animation durations (in seconds)
  durations: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
    loading: 1.5,
  },

  // Easing functions for different animation types
  easings: {
    smooth: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smooth feel
    bounce: [0.68, -0.55, 0.265, 1.55], // Bouncy effect
    sharp: [0.4, 0, 1, 1], // Sharp acceleration
    gentle: [0, 0, 0.2, 1], // Gentle deceleration
  },

  // Spring configurations for different interaction types
  springs: {
    // Button interactions
    button: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 17,
    },
    // Card hover effects
    card: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
    // Modal and overlay animations
    modal: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 30,
    },
    // Layout changes
    layout: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

// Common animation variants used throughout the app
export const commonVariants = {
  // Fade animations
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,

  // Scale animations
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  } as Variants,

  // Slide animations
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  } as Variants,

  slideDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  } as Variants,

  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  } as Variants,

  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  } as Variants,

  // Betting-specific variants
  bettingCard: {
    hidden: { opacity: 0, y: 20, rotateX: -15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: motionConfig.springs.card,
    },
    hover: { 
      y: -5, 
      rotateX: 5, 
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      transition: motionConfig.springs.card,
    },
    tap: { 
      scale: 0.98,
      transition: motionConfig.springs.button,
    },
  } as Variants,

  // Filter animations
  filterSlide: {
    hidden: { opacity: 0, x: -300, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        ...motionConfig.springs.modal,
        staggerChildren: 0.1,
      },
    },
    exit: { 
      opacity: 0, 
      x: -300, 
      scale: 0.95,
      transition: {
        duration: motionConfig.durations.fast,
      },
    },
  } as Variants,

  // Staggered container variants
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  } as Variants,

  // Loading states
  pulse: {
    loading: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: motionConfig.durations.loading,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  } as Variants,

  spinner: {
    loading: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  } as Variants,
};

// Mobile-optimized variants (reduced motion for better performance)
export const mobileVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: motionConfig.durations.fast },
    },
    exit: { 
      opacity: 0,
      transition: { duration: motionConfig.durations.fast },
    },
  } as Variants,

  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: motionConfig.durations.normal,
        ease: motionConfig.easings.smooth,
      },
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: motionConfig.durations.fast },
    },
  } as Variants,

  bettingCard: {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: motionConfig.durations.normal,
        ease: motionConfig.easings.smooth,
      },
    },
    hover: { 
      y: -2,
      transition: { duration: motionConfig.durations.fast },
    },
    tap: { 
      scale: 0.99,
      transition: { duration: 0.1 },
    },
  } as Variants,
};

// Accessibility-aware motion utilities
export const createAccessibleVariants = (
  baseVariants: Variants,
  reduceMotion: boolean = false
): Variants => {
  if (reduceMotion) {
    // Return simplified variants that only animate opacity
    return {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: motionConfig.durations.fast },
      },
      exit: { 
        opacity: 0,
        transition: { duration: motionConfig.durations.fast },
      },
    };
  }
  return baseVariants;
};

// Transition presets for common use cases
export const transitions: Record<string, Transition> = {
  smooth: {
    duration: motionConfig.durations.normal,
    ease: motionConfig.easings.smooth,
  },
  bouncy: {
    type: 'spring',
    ...motionConfig.springs.button,
  },
  quick: {
    duration: motionConfig.durations.fast,
    ease: motionConfig.easings.sharp,
  },
  gentle: {
    duration: motionConfig.durations.slow,
    ease: motionConfig.easings.gentle,
  },
};

// Betting Club specific animation presets
export const bettingAnimations = {
  // For fixture cards
  fixtureCard: {
    variants: commonVariants.bettingCard,
    transition: transitions.smooth,
    whileHover: 'hover',
    whileTap: 'tap',
  },

  // For filter panels
  filterPanel: {
    variants: commonVariants.filterSlide,
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
  },

  // For page transitions
  pageTransition: {
    variants: commonVariants.slideUp,
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    transition: transitions.smooth,
  },

  // For loading states
  loadingSpinner: {
    variants: commonVariants.spinner,
    animate: 'loading',
  },

  // For staggered lists
  fixtureList: {
    variants: commonVariants.staggerContainer,
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
  },
};

// Utility function to detect reduced motion preference
export const shouldReduceMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Performance monitoring for animations
export const logAnimationPerformance = (animationName: string, startTime: number) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 16.67) { // More than one frame at 60fps
    console.warn(`Animation "${animationName}" took ${duration.toFixed(2)}ms (may cause jank)`);
  }
};

export default {
  config: motionConfig,
  variants: commonVariants,
  mobileVariants,
  createAccessibleVariants,
  transitions,
  bettingAnimations,
  shouldReduceMotion,
  logAnimationPerformance,
};
