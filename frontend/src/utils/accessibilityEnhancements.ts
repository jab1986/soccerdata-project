/**
 * Comprehensive accessibility enhancements for the betting club interface
 * Implements WCAG 2.1 AA compliance features including high contrast, 
 * screen reader support, and keyboard navigation enhancements
 */

/**
 * High contrast mode manager
 * Handles dynamic contrast adjustments and theme switching
 */
export class HighContrastManager {
  private isEnabled: boolean = false;
  private originalStyles: Map<string, string> = new Map();
  private contrastStylesheet: HTMLStyleElement | null = null;
  private observers: Set<(enabled: boolean) => void> = new Set();

  constructor() {
    this.initializeHighContrast();
  }

  private initializeHighContrast(): void {
    // Check system preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    this.isEnabled = prefersHighContrast.matches || 
                     localStorage.getItem('betting-club-high-contrast') === 'true';

    // Listen for system preference changes
    prefersHighContrast.addEventListener('change', (e) => {
      if (e.matches) {
        this.enable();
      }
    });

    // Apply initial state
    if (this.isEnabled) {
      this.enable();
    }
  }

  private createContrastStyles(): string {
    return `
      /* High contrast mode styles for betting club */
      .high-contrast {
        --primary-red: #FF0000 !important;
        --primary-yellow: #FFFF00 !important;
        --primary-black: #000000 !important;
        --bg-primary: #FFFFFF !important;
        --text-primary: #000000 !important;
        --text-secondary: #000000 !important;
        --border-color: #000000 !important;
        --shadow-color: transparent !important;
      }
      
      .high-contrast * {
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-color) !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }
      
      .high-contrast button {
        background-color: #000000 !important;
        color: #FFFFFF !important;
        border: 2px solid #FFFFFF !important;
      }
      
      .high-contrast button:hover,
      .high-contrast button:focus {
        background-color: #FFFFFF !important;
        color: #000000 !important;
        border: 2px solid #000000 !important;
      }
      
      .high-contrast a {
        color: #0000FF !important;
        text-decoration: underline !important;
      }
      
      .high-contrast a:hover,
      .high-contrast a:focus {
        color: #FF0000 !important;
        background-color: #FFFF00 !important;
      }
      
      .high-contrast .bg-primary-red {
        background-color: #FF0000 !important;
        color: #FFFFFF !important;
      }
      
      .high-contrast .bg-primary-yellow {
        background-color: #FFFF00 !important;
        color: #000000 !important;
      }
      
      .high-contrast .text-primary-red {
        color: #FF0000 !important;
      }
      
      .high-contrast input,
      .high-contrast textarea,
      .high-contrast select {
        background-color: #FFFFFF !important;
        color: #000000 !important;
        border: 2px solid #000000 !important;
      }
      
      .high-contrast input:focus,
      .high-contrast textarea:focus,
      .high-contrast select:focus {
        outline: 3px solid #FF0000 !important;
        outline-offset: 2px !important;
      }
      
      /* Enhanced focus indicators */
      .high-contrast *:focus {
        outline: 3px solid #FF0000 !important;
        outline-offset: 2px !important;
        background-color: #FFFF00 !important;
        color: #000000 !important;
      }
    `;
  }

  public enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    document.documentElement.classList.add('high-contrast');
    
    // Create and inject contrast stylesheet
    if (!this.contrastStylesheet) {
      this.contrastStylesheet = document.createElement('style');
      this.contrastStylesheet.id = 'betting-club-high-contrast-styles';
      this.contrastStylesheet.textContent = this.createContrastStyles();
      document.head.appendChild(this.contrastStylesheet);
    }

    // Store preference
    localStorage.setItem('betting-club-high-contrast', 'true');
    
    // Notify observers
    this.observers.forEach(callback => callback(true));
    
    // Announce to screen readers
    this.announceChange('High contrast mode enabled');
  }

  public disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    document.documentElement.classList.remove('high-contrast');
    
    // Remove contrast stylesheet
    if (this.contrastStylesheet) {
      this.contrastStylesheet.remove();
      this.contrastStylesheet = null;
    }

    // Store preference
    localStorage.setItem('betting-club-high-contrast', 'false');
    
    // Notify observers
    this.observers.forEach(callback => callback(false));
    
    // Announce to screen readers
    this.announceChange('High contrast mode disabled');
  }

  public toggle(): void {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  public isHighContrastEnabled(): boolean {
    return this.isEnabled;
  }

  public subscribe(callback: (enabled: boolean) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private announceChange(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

/**
 * Enhanced accessibility announcer for screen readers
 * Manages live regions and provides contextual announcements
 */
export class AccessibilityAnnouncer {
  private liveRegions: Map<string, HTMLElement> = new Map();
  private announcementQueue: Array<{ message: string; priority: string; delay: number }> = [];
  private isProcessingQueue: boolean = false;

  constructor() {
    this.initializeLiveRegions();
  }

  private initializeLiveRegions(): void {
    // Create live regions for different priority levels
    const priorities = ['polite', 'assertive', 'status'];
    
    priorities.forEach(priority => {
      const region = document.createElement('div');
      region.id = `live-region-${priority}`;
      region.setAttribute('aria-live', priority === 'status' ? 'polite' : priority);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
      
      document.body.appendChild(region);
      this.liveRegions.set(priority, region);
    });
  }

  public announce(message: string, priority: string = 'polite', delay: number = 100): void {
    if (!message || typeof message !== 'string') return;
    
    // Add to queue
    this.announcementQueue.push({ message, priority, delay });
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processAnnouncementQueue();
    }
  }

  private async processAnnouncementQueue(): Promise<void> {
    this.isProcessingQueue = true;
    
    while (this.announcementQueue.length > 0) {
      const { message, priority, delay } = this.announcementQueue.shift()!;
      
      await this.makeAnnouncement(message, priority, delay);
      
      // Small delay between announcements to prevent overlap
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessingQueue = false;
  }

  private async makeAnnouncement(message: string, priority: string, delay: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const region = this.liveRegions.get(priority) || this.liveRegions.get('polite')!;
        
        // Clear previous content
        region.textContent = '';
        
        // Small delay to ensure screen readers notice the change
        setTimeout(() => {
          region.textContent = message;
          
          // Clear after announcement
          setTimeout(() => {
            region.textContent = '';
            resolve();
          }, Math.max(1000, message.length * 50)); // Dynamic duration based on message length
        }, 50);
      }, delay);
    });
  }

  public announceLoading(isLoading: boolean, context: string = 'content'): void {
    if (isLoading) {
      this.announce(`Loading ${context}, please wait...`, 'assertive');
    } else {
      this.announce(`${context} loaded successfully`, 'polite', 200);
    }
  }

  public announceError(error: string, suggestion: string = ''): void {
    const message = `Error: ${error}${suggestion ? ` ${suggestion}` : ''}`;
    this.announce(message, 'assertive');
  }

  public announceSuccess(action: string, details: string = ''): void {
    const message = `Success: ${action}${details ? ` ${details}` : ''}`;
    this.announce(message, 'polite');
  }

  public announceNavigation(location: string, context: string = ''): void {
    const message = `Navigated to ${location}${context ? ` ${context}` : ''}`;
    this.announce(message, 'polite', 300);
  }

  public announceChange(item: string, value: string, action: string = 'changed'): void {
    const message = `${item} ${action} to ${value}`;
    this.announce(message, 'polite');
  }

  public announceCount(count: number, item: string, action: string = 'found'): void {
    const message = `${count} ${item}${count !== 1 ? 's' : ''} ${action}`;
    this.announce(message, 'status');
  }
}

/**
 * Keyboard navigation enhancer
 * Adds advanced keyboard shortcuts and navigation patterns
 */
export class KeyboardNavigationEnhancer {
  private shortcuts: Map<string, () => void> = new Map();
  private isActive: boolean = false;

  constructor() {
    this.setupDefaultShortcuts();
  }

  private setupDefaultShortcuts(): void {
    // Skip to main content (Alt + M)
    this.addShortcut('alt+m', () => {
      const main = document.getElementById('main-content') || document.querySelector('main');
      if (main) {
        main.focus();
        main.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Skip to navigation (Alt + N)
    this.addShortcut('alt+n', () => {
      const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
      if (nav) {
        const firstLink = nav.querySelector('a, button');
        if (firstLink) {
          (firstLink as HTMLElement).focus();
        }
      }
    });

    // Toggle filters (Alt + F)
    this.addShortcut('alt+f', () => {
      const filterToggle = document.querySelector('[aria-controls="mobile-filters"]');
      if (filterToggle) {
        (filterToggle as HTMLElement).click();
      }
    });

    // Search teams (Alt + S)
    this.addShortcut('alt+s', () => {
      const searchInput = document.getElementById('team-search');
      if (searchInput) {
        (searchInput as HTMLElement).focus();
      }
    });
  }

  public addShortcut(combination: string, callback: () => void): void {
    this.shortcuts.set(combination.toLowerCase(), callback);
  }

  public removeShortcut(combination: string): void {
    this.shortcuts.delete(combination.toLowerCase());
  }

  public activate(): void {
    if (this.isActive) return;
    this.isActive = true;
    document.addEventListener('keydown', this.handleKeyDown);
  }

  public deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const combination = this.getCombination(event);
    const callback = this.shortcuts.get(combination);
    
    if (callback) {
      event.preventDefault();
      callback();
    }
  }

  private getCombination(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');
    
    parts.push(event.key.toLowerCase());
    
    return parts.join('+');
  }
}

/**
 * Initialize all accessibility enhancements
 */
export function initializeAccessibilityEnhancements() {
  const highContrast = new HighContrastManager();
  const announcer = new AccessibilityAnnouncer();
  const keyboardEnhancer = new KeyboardNavigationEnhancer();
  
  // Activate keyboard enhancements
  keyboardEnhancer.activate();
  
  // Add help text for keyboard shortcuts
  const helpText = document.createElement('div');
  helpText.id = 'accessibility-help';
  helpText.className = 'sr-only';
  helpText.textContent = 'Keyboard shortcuts: Alt+M for main content, Alt+N for navigation, Alt+F for filters, Alt+S for search';
  document.body.appendChild(helpText);
  
  return {
    highContrast,
    announcer,
    keyboardEnhancer,
  };
}
