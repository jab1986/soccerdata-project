/**
 * Focus management utilities for accessibility
 * Includes focus trapping, skip links, and focus restoration
 */

/**
 * Focus trap manager for modals and dialogs
 */
export class FocusTrap {
  constructor(element) {
    this.element = element;
    this.previousFocus = null;
    this.isActive = false;
    this.focusableSelectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]:not([tabindex="-1"])'
    ].join(', ');
  }

  /**
   * Get all focusable elements within the trap
   */
  getFocusableElements() {
    if (!this.element) return [];
    
    const elements = Array.from(this.element.querySelectorAll(this.focusableSelectors))
      .filter(element => {
        return element.offsetWidth > 0 && 
               element.offsetHeight > 0 && 
               !element.hasAttribute('aria-hidden');
      });
    
    return elements;
  }

  /**
   * Activate the focus trap
   */
  activate() {
    if (this.isActive) return;

    this.previousFocus = document.activeElement;
    this.isActive = true;

    // Focus first element
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Add event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('focusin', this.handleFocusIn);
  }

  /**
   * Deactivate the focus trap
   */
  deactivate() {
    if (!this.isActive) return;

    this.isActive = false;
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('focusin', this.handleFocusIn);

    // Restore previous focus
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }
  }

  /**
   * Handle keydown events for the trap
   */
  handleKeyDown = (event) => {
    if (event.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forwards)
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Handle focus events to keep focus within trap
   */
  handleFocusIn = (event) => {
    if (!this.element.contains(event.target)) {
      const focusableElements = this.getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }
}

/**
 * Create a focus trap for an element
 * @param {HTMLElement} element - Element to trap focus within
 * @returns {FocusTrap} Focus trap instance
 */
export function createFocusTrap(element) {
  return new FocusTrap(element);
}

/**
 * Focus the first focusable element in a container
 * @param {HTMLElement} container - Container element
 * @param {string} fallbackSelector - Fallback selector if no focusable elements found
 */
export function focusFirst(container, fallbackSelector = null) {
  if (!container) return false;

  const focusableSelectors = [
    'input:not([disabled]):not([type="hidden"])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]'
  ];

  for (const selector of focusableSelectors) {
    const element = container.querySelector(selector);
    if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
      element.focus();
      return true;
    }
  }

  // Fallback
  if (fallbackSelector) {
    const fallback = container.querySelector(fallbackSelector);
    if (fallback) {
      fallback.focus();
      return true;
    }
  }

  return false;
}

/**
 * Restore focus to a previously focused element
 * @param {HTMLElement} element - Element to restore focus to
 * @param {Object} options - Options for focus restoration
 */
export function restoreFocus(element, options = {}) {
  const { preventScroll = false, delay = 0 } = options;

  if (!element || !element.focus) return;

  const restore = () => {
    try {
      element.focus({ preventScroll });
    } catch (error) {
      console.warn('Failed to restore focus:', error);
    }
  };

  if (delay > 0) {
    setTimeout(restore, delay);
  } else {
    restore();
  }
}

/**
 * Get the next focusable element in tab order
 * @param {HTMLElement} currentElement - Current focused element
 * @param {HTMLElement} container - Container to search within
 * @returns {HTMLElement|null} Next focusable element
 */
export function getNextFocusable(currentElement, container = document.body) {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);
  
  if (currentIndex === -1) return focusableElements[0] || null;
  
  const nextIndex = (currentIndex + 1) % focusableElements.length;
  return focusableElements[nextIndex] || null;
}

/**
 * Get the previous focusable element in tab order
 * @param {HTMLElement} currentElement - Current focused element
 * @param {HTMLElement} container - Container to search within
 * @returns {HTMLElement|null} Previous focusable element
 */
export function getPreviousFocusable(currentElement, container = document.body) {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);
  
  if (currentIndex === -1) return focusableElements[focusableElements.length - 1] || null;
  
  const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
  return focusableElements[prevIndex] || null;
}

/**
 * Get all focusable elements in a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
export function getFocusableElements(container = document.body) {
  const selector = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(container.querySelectorAll(selector))
    .filter(element => {
      return element.offsetWidth > 0 && 
             element.offsetHeight > 0 && 
             !element.hasAttribute('aria-hidden') &&
             getComputedStyle(element).visibility !== 'hidden';
    });
}

/**
 * Create skip link functionality
 * @param {Object} options - Skip link configuration
 */
export function createSkipLinks(options = {}) {
  const {
    skipToMain = true,
    skipToNavigation = false,
    customSkips = [],
    className = 'skip-link',
    containerClassName = 'skip-links'
  } = options;

  // Check if skip links already exist
  if (document.querySelector('.skip-links')) {
    return;
  }

  const container = document.createElement('div');
  container.className = containerClassName;
  container.setAttribute('aria-label', 'Skip links');
  
  // Add CSS for skip links
  const style = document.createElement('style');
  style.textContent = `
    .skip-links {
      position: absolute;
      top: -100px;
      left: 0;
      right: 0;
      z-index: 9999;
    }
    .skip-link {
      position: absolute;
      top: -100px;
      left: 10px;
      background: #000;
      color: #fff;
      padding: 8px 16px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      transition: top 0.2s;
    }
    .skip-link:focus {
      top: 10px;
    }
  `;
  document.head.appendChild(style);

  // Create default skip links
  if (skipToMain) {
    const mainSkip = document.createElement('a');
    mainSkip.href = '#main-content';
    mainSkip.className = className;
    mainSkip.textContent = 'Skip to main content';
    mainSkip.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.querySelector('main, #main-content, [role="main"]');
      if (main) {
        main.focus();
        main.scrollIntoView();
      }
    });
    container.appendChild(mainSkip);
  }

  if (skipToNavigation) {
    const navSkip = document.createElement('a');
    navSkip.href = '#navigation';
    navSkip.className = className;
    navSkip.textContent = 'Skip to navigation';
    navSkip.addEventListener('click', (e) => {
      e.preventDefault();
      const nav = document.querySelector('nav, #navigation, [role="navigation"]');
      if (nav) {
        nav.focus();
        nav.scrollIntoView();
      }
    });
    container.appendChild(navSkip);
  }

  // Add custom skip links
  customSkips.forEach(skip => {
    const link = document.createElement('a');
    link.href = `#${skip.target}`;
    link.className = className;
    link.textContent = skip.text;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(`#${skip.target}`);
      if (target) {
        target.focus();
        target.scrollIntoView();
      }
    });
    container.appendChild(link);
  });

  // Insert at the beginning of body
  document.body.insertBefore(container, document.body.firstChild);
}

/**
 * Focus element with enhanced options
 * @param {HTMLElement|string} elementOrSelector - Element or selector
 * @param {Object} options - Focus options
 */
export function focusElement(elementOrSelector, options = {}) {
  const {
    preventScroll = false,
    timeout = 0,
    scrollIntoView = false,
    scrollBehavior = 'smooth'
  } = options;

  const focus = () => {
    let element;
    
    if (typeof elementOrSelector === 'string') {
      element = document.querySelector(elementOrSelector);
    } else {
      element = elementOrSelector;
    }

    if (!element || !element.focus) return false;

    try {
      element.focus({ preventScroll });
      
      if (scrollIntoView && !preventScroll) {
        element.scrollIntoView({
          behavior: scrollBehavior,
          block: 'center',
          inline: 'nearest'
        });
      }
      
      return true;
    } catch (error) {
      console.warn('Failed to focus element:', error);
      return false;
    }
  };

  if (timeout > 0) {
    setTimeout(focus, timeout);
  } else {
    return focus();
  }
}

export default {
  FocusTrap,
  createFocusTrap,
  focusFirst,
  restoreFocus,
  getNextFocusable,
  getPreviousFocusable,
  getFocusableElements,
  createSkipLinks,
  focusElement
};
