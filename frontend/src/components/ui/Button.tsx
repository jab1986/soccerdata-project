import React from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';
import { motion } from 'framer-motion';

// Define button animation variants
const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.98 },
  disabled: { opacity: 0.7 }
};

// Button component props interface following the betting club design system
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-controls'?: string;
  id?: string;
  title?: string;
  form?: string;
  value?: string;
  name?: string;
  // autoFocus removed for accessibility - use programmatic focus management instead
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  announceAction?: boolean; // Whether to announce button actions to screen readers
  children?: React.ReactNode;
}

// Button component with betting club styling and accessibility
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      startIcon,
      endIcon,
      className = '',
      onClick,
      type = 'button',
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-expanded': ariaExpanded,
      'aria-pressed': ariaPressed,
      'aria-controls': ariaControls,
      id,
      title,
      form,
      value,
      name,
      // autoFocus removed for accessibility - use programmatic focus management instead
      onFocus,
      onBlur,
      onKeyDown,
      announceAction = false,
      ...props
    },
    ref
  ) => {
    const { getEmojiDescription, announce } = useAccessibility();
    // Base button styles with mobile-first design
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed min-h-touch';

    // Variant styles using betting club colors
    const variantStyles = {
      primary: 'bg-primary-red text-white hover:bg-red-700 active:bg-red-800 focus:ring-primary-red disabled:bg-gray-400',
      secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 disabled:bg-gray-400',
      ghost: 'bg-transparent text-primary-red hover:bg-red-50 active:bg-red-100 focus:ring-primary-red disabled:text-gray-400 disabled:hover:bg-transparent'
    };

    // Size styles with responsive design
    const sizeStyles = {
      sm: 'px-3 py-1.5 mobile:px-4 mobile:py-2 text-xs mobile:text-sm',
      md: 'px-4 py-3 mobile:px-6 mobile:py-4 text-sm mobile:text-base',
      lg: 'px-6 py-4 mobile:px-8 mobile:py-5 text-base mobile:text-lg'
    };

    // Loading spinner component
    const LoadingSpinner = () => (
      <div className="animate-spin rounded-full border-b-2 border-current mr-2 mobile:mr-3" 
           style={{ 
             width: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px',
             height: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px'
           }}
           aria-hidden="true"
      />
    );

    // Combine all styles
    const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    // Handle click with loading state and accessibility announcements
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && onClick) {
        onClick(event);
        
        // Announce action to screen readers if requested
        if (announceAction && !loading) {
          const actionText = ariaLabel || (typeof children === 'string' ? children : 'action');
          announce(`${actionText} activated`, 'polite', 50);
        }
      }
    };

    // Enhanced keyboard handling
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Call custom onKeyDown if provided
      if (onKeyDown) {
        onKeyDown(event);
      }

      // Handle Enter and Space for button activation (browsers do this by default, but being explicit)
      if ((event.key === 'Enter' || event.key === ' ') && !disabled && !loading) {
        event.preventDefault();
        const syntheticEvent = {
          ...event,
          type: 'click',
          currentTarget: event.currentTarget,
          target: event.target
        } as unknown as React.MouseEvent<HTMLButtonElement>;
        handleClick(syntheticEvent);
      }
    };

    // Process children to add accessibility descriptions for emojis
    const processChildren = (children: React.ReactNode): React.ReactNode => {
      if (typeof children === 'string') {
        // Replace emojis with accessible versions
        return children.split(/(\p{Extended_Pictographic})/gu).map((part, index) => {
          if (/\p{Extended_Pictographic}/u.test(part)) {
            const description = getEmojiDescription(part);
            return (
              <span key={index} aria-label={description} role="img">
                {part}
              </span>
            );
          }
          return part;
        });
      }
      return children;
    };

    // Determine if button has focus indicator styles
    const hasFocusStyles = buttonStyles.includes('focus:ring-');
    const enhancedStyles = hasFocusStyles 
      ? buttonStyles 
      : `${buttonStyles} focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`;

    return (
      <motion.button
        ref={ref}
        id={id}
        type={type}
        className={enhancedStyles}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        aria-controls={ariaControls}
        aria-disabled={disabled || loading}
        title={title}
        form={form}
        value={value}
        name={name}
        // autoFocus removed for accessibility - use programmatic focus management instead
        variants={buttonVariants}
        animate={disabled || loading ? 'disabled' : 'default'}
        whileHover={!(disabled || loading) ? 'hover' : undefined}
        whileTap={!(disabled || loading) ? 'tap' : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 17 }}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && startIcon && (
          <span className="mr-2 mobile:mr-3" aria-hidden="true">
            {startIcon}
          </span>
        )}
        {processChildren(children)}
        {!loading && endIcon && (
          <span className="ml-2 mobile:ml-3" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </motion.button>
    );
  }
);

// Display name for debugging
Button.displayName = 'Button';

export default Button;
export type { ButtonProps };
