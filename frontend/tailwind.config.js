/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    screens: {
      'xs': '360px',      // Small mobile devices
      'sm': '640px',      // Default Tailwind sm (mobile landscape)
      'md': '768px',      // Default Tailwind md (tablets)
      'lg': '1024px',     // Default Tailwind lg (laptops)
      'xl': '1280px',     // Default Tailwind xl (desktops)
      '2xl': '1536px',    // Default Tailwind 2xl (large desktops)
      // Custom device breakpoints
      'mobile': '480px',  // Mid-size mobile devices
      'tablet': '960px',  // Larger tablets, small laptops
      'desktop': '1440px',// Standard desktop screens
      'widescreen': '1920px', // Large desktop monitors
    },
    extend: {
      colors: {
        // Super Cool Betting Club Color Scheme
        primary: {
          black: '#1a1a1a',
          red: '#dc2626',
          yellow: '#fbbf24',
        },
        // Additional shades for better UX
        gray: {
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          400: '#9ca3af',
          300: '#d1d5db',
          200: '#e5e7eb',
          100: '#f3f4f6',
          50: '#f9fafb',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Open Sans"', '"Helvetica Neue"', 'sans-serif'],
      },
      boxShadow: {
        'betting': '0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06)',
        'betting-lg': '0 10px 15px -3px rgba(220, 38, 38, 0.1), 0 4px 6px -2px rgba(220, 38, 38, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // Fluid responsive typography presets
      fontSize: {
        'fluid-sm': ['clamp(0.875rem, 0.8rem + 0.2vw, 1rem)', { lineHeight: '1.5rem' }],
        'fluid-base': ['clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', { lineHeight: '1.75rem' }],
        'fluid-lg': ['clamp(1.125rem, 1rem + 0.5vw, 1.25rem)', { lineHeight: '1.75rem' }],
        'fluid-xl': ['clamp(1.25rem, 1.15rem + 0.6vw, 1.5rem)', { lineHeight: '2rem' }],
        'fluid-2xl': ['clamp(1.5rem, 1.25rem + 1vw, 2rem)', { lineHeight: '2.5rem' }],
        'fluid-3xl': ['clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)', { lineHeight: '3rem' }],
        'fluid-4xl': ['clamp(2.25rem, 1.75rem + 2vw, 3rem)', { lineHeight: '3.5rem' }],
      },
      spacing: {
        // Responsive spacing utilities for better touch targets
        'touch': '44px',  // Minimum touch target size (W3C recommendation)
        'touch-lg': '48px', // Larger touch target for important actions
      }
    },
  },
  plugins: [
    // Add plugin for container queries support (uncomment when installed)
    // require('@tailwindcss/container-queries'),
  ],
}