import React from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';
import { motion } from 'framer-motion';

// Define card animation variants
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.98 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  hover: {
    y: -2,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: 'easeInOut'
    }
  }
};

// Card component props interface for betting club design
interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean; // for hover/active states
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'betting';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
  role?: string;
  tabIndex?: number;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  'data-keyboard-item'?: boolean; // For keyboard navigation
}

// Card component with betting club styling and mobile-first design
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      interactive = false,
      padding = 'md',
      shadow = 'sm',
      onClick,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      id,
      role,
      tabIndex,
      onFocus,
      onBlur,
      onKeyDown,
      'data-keyboard-item': dataKeyboardItem,
      ...props
    },
    ref
  ) => {
    const { announce } = useAccessibility();
    // Base card styles
    const baseStyles = 'bg-white rounded-lg border border-gray-200 transition-all duration-150';

    // Interactive styles for clickable cards - removed transform to avoid conflicts with Framer Motion
    const interactiveStyles = interactive
      ? 'cursor-pointer hover:shadow-md active:shadow-lg touch-manipulation'
      : '';

    // Padding styles with mobile-first design
    const paddingStyles = {
      sm: 'p-3 mobile:p-4',
      md: 'p-4 mobile:p-5 tablet:p-4 desktop:p-6',
      lg: 'p-6 mobile:p-7 tablet:p-6 desktop:p-8'
    };

    // Shadow styles including betting club specific shadow
    const shadowStyles = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      betting: 'shadow-betting' // Custom betting club shadow from existing CSS
    };

    // Combine all styles
    const cardStyles = `${baseStyles} ${interactiveStyles} ${paddingStyles[padding]} ${shadowStyles[shadow]} ${className}`;

    // Handle click events with accessibility announcements
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        onClick(event);
        
        // Announce card activation for screen readers
        const cardLabel = ariaLabel || 'card';
        announce(`${cardLabel} selected`, 'polite', 100);
      }
    };

    // Determine if card should be clickable and focusable
    const isClickable = Boolean(onClick);
    const cardRole = role || (isClickable ? 'button' : undefined);
    const cardTabIndex = tabIndex !== undefined ? tabIndex : (isClickable ? 0 : undefined);

    // Enhanced keyboard navigation for clickable cards
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Call custom onKeyDown if provided
      if (onKeyDown) {
        onKeyDown(event);
      }

      if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.stopPropagation();
        
        const syntheticEvent = {
          ...event,
          type: 'click',
          currentTarget: event.currentTarget,
          target: event.target
        } as unknown as React.MouseEvent<HTMLDivElement>;
        
        handleClick(syntheticEvent);
      }
    };

    // Add focus styles for keyboard navigation
    const focusStyles = isClickable 
      ? 'focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2' 
      : '';

    // Combine all styles with proper naming
    const finalCardStyles = `${cardStyles} ${focusStyles}`;

    return (
      <motion.div
        ref={ref}
        id={id}
        className={finalCardStyles}
        onClick={isClickable ? handleClick : undefined}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        onFocus={onFocus}
        onBlur={onBlur}
        role={cardRole}
        tabIndex={cardTabIndex}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        data-keyboard-item={dataKeyboardItem || (isClickable ? true : undefined)}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={isClickable ? "hover" : undefined}
        whileTap={isClickable ? "tap" : undefined}
        layout
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

// Display name for debugging
Card.displayName = 'Card';

// Card Header component for structured content
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-3 mobile:mb-4 ${className}`}>
      {children}
    </div>
  );
};

// Card Body component for main content
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex-1 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer component for actions
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-3 mobile:mt-4 pt-3 mobile:pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Export Card with its subcomponents
// Use type assertion to allow attaching static properties
(Card as any).Header = CardHeader;
(Card as any).Body = CardBody;
(Card as any).Footer = CardFooter;

export default Card;
export { CardHeader, CardBody, CardFooter };
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };
