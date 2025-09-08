import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  HighContrastManager, 
  AccessibilityAnnouncer, 
  initializeAccessibilityEnhancements 
} from '../utils/accessibilityEnhancements';
import { validateBettingClubColors, checkContrastCompliance } from '../utils/colorContrast';

/**
 * Enhanced custom hook for accessibility features including screen reader announcements,
 * focus management, high contrast mode, and WCAG 2.1 AA compliance
 * 
 * @returns {Object} Accessibility utilities and state
 */
export function useAccessibility() {
  const [announcements, setAnnouncements] = useState([]);
  const [isHighContrastMode, setIsHighContrastMode] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [colorContrastResults, setColorContrastResults] = useState(null);
  const liveRegionRef = useRef(null);
  const announcementTimeoutRef = useRef(null);
  const highContrastManagerRef = useRef(null);
  const accessibilityAnnouncerRef = useRef(null);
  const enhancementsInitialized = useRef(false);

  // Initialize accessibility enhancements
  useEffect(() => {
    if (!enhancementsInitialized.current) {
      const { highContrast, announcer } = initializeAccessibilityEnhancements();
      highContrastManagerRef.current = highContrast;
      accessibilityAnnouncerRef.current = announcer;
      enhancementsInitialized.current = true;
      
      // Set initial high contrast state
      setIsHighContrastMode(highContrast.isHighContrastEnabled());
    }
  }, []);

  // Detect user preferences and validate colors
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(prefersReducedMotion.matches);

    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    prefersReducedMotion.addListener(handleMotionChange);

    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = (e) => {
      setIsHighContrastMode(e.matches);
      if (highContrastManagerRef.current) {
        if (e.matches) {
          highContrastManagerRef.current.enable();
        } else {
          highContrastManagerRef.current.disable();
        }
      }
    };
    prefersHighContrast.addListener(handleContrastChange);

    // Validate betting club color scheme
    const validateColors = async () => {
      try {
        const results = validateBettingClubColors();
        setColorContrastResults(results);
        
        // Log validation results in development
        if (process.env.NODE_ENV === 'development') {
          console.group('🎨 Color Contrast Validation');
          console.log('Overall Compliance:', results.overallCompliance);
          results.combinations.forEach(combo => {
            const status = combo.normal.isCompliant ? '✅' : '❌';
            console.log(`${status} ${combo.name}: ${combo.normal.ratio?.toFixed(2)} (requires ${combo.normal.required})`);
          });
          console.groupEnd();
        }
      } catch (error) {
        console.warn('Color validation failed:', error);
      }
    };
    
    validateColors();

    return () => {
      prefersReducedMotion.removeListener(handleMotionChange);
      prefersHighContrast.removeListener(handleContrastChange);
    };
  }, []);

  /**
   * Enhanced announce function using accessibility announcer
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite', 'assertive', or 'status'
   * @param {number} delay - Delay before announcement (ms)
   */
  const announce = useCallback((message, priority = 'polite', delay = 100) => {
    if (!message) return;

    // Use enhanced announcer if available
    if (accessibilityAnnouncerRef.current) {
      accessibilityAnnouncerRef.current.announce(message, priority, delay);
      return;
    }

    // Fallback to original implementation
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }

    announcementTimeoutRef.current = setTimeout(() => {
      const timestamp = Date.now();
      const announcement = {
        id: `announcement-${timestamp}`,
        message,
        priority,
        timestamp
      };

      setAnnouncements(prev => {
        const updated = [...prev, announcement].slice(-3);
        return updated;
      });

      setTimeout(() => {
        setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
      }, 1000);
    }, delay);
  }, []);

  /**
   * Announce filter changes with context
   * @param {string} filterType - Type of filter (league, team, date)
   * @param {string} filterValue - Value that was changed
   * @param {boolean} isAdded - Whether filter was added or removed
   * @param {number} resultCount - Number of results after filter
   */
  const announceFilterChange = useCallback((filterType, filterValue, isAdded, resultCount) => {
    const action = isAdded ? 'applied' : 'removed';
    const message = `${filterType} filter ${action}: ${filterValue}. Showing ${resultCount} fixture${resultCount === 1 ? '' : 's'}.`;
    announce(message, 'polite', 150);
  }, [announce]);

  /**
   * Enhanced loading announcements
   */
  const announceLoading = useCallback((isLoading, context = 'content') => {
    if (accessibilityAnnouncerRef.current) {
      accessibilityAnnouncerRef.current.announceLoading(isLoading, context);
    } else {
      if (isLoading) {
        announce(`Loading ${context}, please wait...`, 'assertive');
      }
    }
  }, [announce]);

  /**
   * Enhanced error announcements
   */
  const announceError = useCallback((error, suggestion = '') => {
    if (accessibilityAnnouncerRef.current) {
      accessibilityAnnouncerRef.current.announceError(error, suggestion);
    } else {
      const message = `Error: ${error}${suggestion ? ` ${suggestion}` : ''}`;
      announce(message, 'assertive');
    }
  }, [announce]);

  /**
   * Enhanced success announcements
   */
  const announceSuccess = useCallback((action, details = '') => {
    if (accessibilityAnnouncerRef.current) {
      accessibilityAnnouncerRef.current.announceSuccess(action, details);
    } else {
      const message = `Success: ${action}${details ? ` ${details}` : ''}`;
      announce(message, 'polite');
    }
  }, [announce]);

  /**
   * Toggle high contrast mode
   */
  const toggleHighContrast = useCallback(() => {
    if (highContrastManagerRef.current) {
      highContrastManagerRef.current.toggle();
      setIsHighContrastMode(highContrastManagerRef.current.isHighContrastEnabled());
    }
  }, []);

  /**
   * Check color contrast compliance
   * @param {string} foreground - Foreground color
   * @param {string} background - Background color
   * @param {boolean} isLargeText - Whether text is large
   * @returns {Object} Contrast compliance result
   */
  const checkContrast = useCallback((foreground, background, isLargeText = false) => {
    return checkContrastCompliance(foreground, background, isLargeText, 'AA');
  }, []);

  /**
   * Enhanced focus management with high contrast support
   */
  const focusElement = useCallback((elementOrSelector, options = {}) => {
    const { 
      preventScroll = false, 
      announceTarget = true,
      scrollBehavior = 'smooth',
      addHighContrastIndicator = true
    } = options;

    try {
      let element;
      if (typeof elementOrSelector === 'string') {
        element = document.querySelector(elementOrSelector);
      } else {
        element = elementOrSelector;
      }

      if (element && element.focus) {
        element.focus({ preventScroll });
        
        // Add high contrast focus indicator if enabled and needed
        if (addHighContrastIndicator && isHighContrastMode) {
          element.style.outline = '3px solid #0066FF';
          element.style.outlineOffset = '2px';
          
          const removeIndicator = () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
            element.removeEventListener('blur', removeIndicator);
          };
          element.addEventListener('blur', removeIndicator, { once: true });
        }
        
        // Scroll into view if needed and not prevented
        if (!preventScroll) {
          element.scrollIntoView({ 
            behavior: isReducedMotion ? 'auto' : scrollBehavior,
            block: 'center'
          });
        }

        // Announce focus target for screen readers
        if (announceTarget) {
          const label = element.getAttribute('aria-label') || 
                       element.getAttribute('title') ||
                       element.textContent ||
                       'element';
          announce(`Focused ${label}`, 'polite', 200);
        }
        
        return true;
      }
    } catch (error) {
      console.warn('Failed to focus element:', error);
    }
    return false;
  }, [announce, isReducedMotion, isHighContrastMode]);

  /**
   * Skip to main content (skip link functionality)
   */
  const skipToMain = useCallback(() => {
    const mainContent = document.querySelector('main, #main-content, [role="main"]');
    if (mainContent) {
      focusElement(mainContent, { announceTarget: true });
      announce('Skipped to main content', 'polite');
    }
  }, [focusElement, announce]);

  /**
   * Get accessible description for emojis and icons with more comprehensive mapping
   * @param {string} emoji - Emoji character
   * @returns {string} Accessible description
   */
  const getEmojiDescription = useCallback((emoji) => {
    const descriptions = {
      '🏆': 'trophy',
      '⚽': 'soccer ball',
      '🎯': 'target',
      '📅': 'calendar',
      '🔄': 'refresh',
      '📥': 'download',
      '🗑️': 'delete',
      '✅': 'completed',
      '❌': 'error',
      '🃊': 'cards',
      '☷': 'table',
      '▲': 'up arrow',
      '▼': 'down arrow',
      '👍': 'thumbs up',
      '⚠️': 'warning',
      '🔍': 'search',
      '📊': 'chart',
      '🎮': 'game controller',
      '🏁': 'checkered flag',
      '⭐': 'star',
      '💡': 'light bulb',
      '🔒': 'locked',
      '🔓': 'unlocked',
      '📱': 'mobile phone',
      '💻': 'laptop',
      '🖥️': 'desktop computer',
      '⏰': 'alarm clock',
      '📈': 'trending up',
      '📉': 'trending down'
    };
    return descriptions[emoji] || 'icon';
  }, []);

  /**
   * Enhanced number formatting for screen readers with better context
   * @param {number} number - Number to format
   * @param {string} context - Context for the number (e.g., 'fixtures', 'teams')
   * @returns {string} Formatted number with context
   */
  const formatNumberForScreenReader = useCallback((number, context = '') => {
    if (number === 0) return context ? `no ${context}` : 'zero';
    if (number === 1) return context ? `one ${context.slice(0, -1)}` : 'one'; // Remove plural 's'
    
    const formattedNumber = number.toLocaleString();
    return context ? `${formattedNumber} ${context}` : formattedNumber;
  }, []);

  /**
   * Get current accessibility status
   */
  const getAccessibilityStatus = useCallback(() => {
    return {
      isHighContrastMode,
      isReducedMotion,
      colorContrastResults,
      hasValidColors: colorContrastResults?.overallCompliance || false,
      enhancementsEnabled: enhancementsInitialized.current
    };
  }, [isHighContrastMode, isReducedMotion, colorContrastResults]);

  return {
    // State
    announcements,
    isHighContrastMode,
    isReducedMotion,
    colorContrastResults,
    liveRegionRef,

    // Enhanced announcement functions
    announce,
    announceFilterChange,
    announceLoading,
    announceError,
    announceSuccess,

    // Focus management
    focusElement,
    skipToMain,

    // Accessibility controls
    toggleHighContrast,
    checkContrast,
    getAccessibilityStatus,

    // Utility functions
    getEmojiDescription,
    formatNumberForScreenReader
  };
}

export default useAccessibility;
