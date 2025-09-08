import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlayIcon,
  TrophyIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

// Define badge animation variants
const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'reverse' as const
    }
  }
};

// Badge component props interface for betting club design
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  rounded?: boolean;
  icon?: React.ReactNode;
}

// Badge component with betting club styling and accessibility
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  rounded = true,
  icon,
  ...props
}) => {
  // Base badge styles
  const baseStyles = 'inline-flex items-center font-medium transition-colors duration-150';

  // Variant styles using betting club colors and accessible contrast
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-red text-white',
    secondary: 'bg-primary-yellow text-primary-black',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  // Size styles with mobile-responsive design
  const sizeStyles = {
    sm: 'px-2 py-1 mobile:px-3 mobile:py-1.5 text-xs mobile:text-sm',
    md: 'px-3 py-1.5 mobile:px-4 mobile:py-2 text-xs mobile:text-sm',
    lg: 'px-4 py-2 mobile:px-5 mobile:py-2.5 text-sm mobile:text-base'
  };

  // Border radius styles
  const radiusStyles = rounded ? 'rounded-full' : 'rounded';

  // Combine all styles
  const badgeStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${radiusStyles} ${className}`;

  return (
    <motion.span 
      className={badgeStyles} 
      variants={badgeVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {icon && (
        <span className={`${size === 'sm' ? 'mr-1' : 'mr-1 mobile:mr-2'} flex-shrink-0`} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </motion.span>
  );
};

// Status Badge component for common betting club statuses
interface StatusBadgeProps {
  status: 'available' | 'finished' | 'pending' | 'cancelled' | 'live';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  // Status configurations with betting club terminology and Heroicons
  const statusConfig = {
    available: {
      variant: 'primary' as const,
      icon: <PlayIcon className="w-4 h-4" />,
      text: 'Available',
      animation: undefined
    },
    finished: {
      variant: 'success' as const,
      icon: <CheckCircleIcon className="w-4 h-4" />,
      text: 'Finished',
      animation: undefined
    },
    pending: {
      variant: 'warning' as const,
      icon: <ClockIcon className="w-4 h-4" />,
      text: 'Pending',
      animation: undefined
    },
    cancelled: {
      variant: 'error' as const,
      icon: <XCircleIcon className="w-4 h-4" />,
      text: 'Cancelled',
      animation: undefined
    },
    live: {
      variant: 'error' as const,
      icon: <PlayIcon className="w-4 h-4" />,
      text: 'Live',
      animation: 'pulse' as const
    }
  };

  const config = statusConfig[status];

  return (
    <motion.span
      variants={badgeVariants}
      initial="hidden"
      animate={config.animation || "visible"}
    >
      <Badge
        variant={config.variant}
        size={size}
        className={className}
        icon={config.icon}
      >
        {config.text}
      </Badge>
    </motion.span>
  );
};

// League Badge component for league indicators
interface LeagueBadgeProps {
  league: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LeagueBadge: React.FC<LeagueBadgeProps> = ({
  league,
  size = 'md',
  className = ''
}) => {
  // Clean up league name for display
  const displayName = league
    .replace('ENG-', '')
    .replace('ESP-', '')
    .replace('ITA-', '')
    .replace('GER-', '')
    .replace('FRA-', '');

  return (
    <Badge
      variant="secondary"
      size={size}
      className={className}
      icon={<TrophyIcon className="w-4 h-4" />}
    >
      {displayName}
    </Badge>
  );
};

// Count Badge component for showing counts
interface CountBadgeProps {
  count: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max,
  size = 'sm',
  className = ''
}) => {
  // Display count or max+ format
  const displayCount = max && count > max ? `${max}+` : count.toString();
  
  // Determine variant based on count
  const variant = count === 0 ? 'default' : 'primary';

  return (
    <Badge
      variant={variant}
      size={size}
      className={className}
      rounded
    >
      {displayCount}
    </Badge>
  );
};

// Export Badge with its variants
// Use type assertion to allow attaching static properties
(Badge as any).Status = StatusBadge;
(Badge as any).League = LeagueBadge;
(Badge as any).Count = CountBadge;

export default Badge;
export { StatusBadge, LeagueBadge, CountBadge };
export type { BadgeProps, StatusBadgeProps, LeagueBadgeProps, CountBadgeProps };
