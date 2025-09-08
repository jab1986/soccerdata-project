/**
 * Accessibility Testing and Validation Utilities
 * Comprehensive WCAG 2.1 AA compliance checking
 */

import { checkContrastCompliance, validateBettingClubColors } from './colorContrast';

/**
 * Accessibility test result interface
 */
export interface AccessibilityTestResult {
  testName: string;
  passed: boolean;
  level: 'AA' | 'AAA';
  description: string;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Complete accessibility audit result
 */
export interface AccessibilityAudit {
  overallScore: number; // 0-100
  passed: boolean;
  totalTests: number;
  passedTests: number;
  results: AccessibilityTestResult[];
  summary: {
    critical: number;
    warnings: number;
    suggestions: number;
  };
}

/**
 * Test keyboard navigation functionality
 * @param container - Container element to test
 * @returns Test result
 */
export function testKeyboardNavigation(container: HTMLElement | null): AccessibilityTestResult {
  const result: AccessibilityTestResult = {
    testName: 'Keyboard Navigation',
    passed: true,
    level: 'AA',
    description: 'All interactive elements must be keyboard accessible',
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!container) {
    result.passed = false;
    result.errors.push('Container element not found');
    return result;
  }

  // Test focusable elements
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([type="hidden"]):not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]'
  ];

  const focusableElements = Array.from(container.querySelectorAll(focusableSelectors.join(', ')));
  
  if (focusableElements.length === 0) {
    result.warnings.push('No focusable elements found in container');
  }

  // Check for tab traps and missing focus indicators
  focusableElements.forEach((element, index) => {
    const el = element as HTMLElement;
    
    // Check for skip links
    if (index === 0) {
      const skipLink = container.querySelector('a[href="#main-content"], .skip-link');
      if (!skipLink) {
        result.suggestions.push('Consider adding skip links for better navigation');
      }
    }
    
    // Check for ARIA labels on interactive elements
    if (!el.hasAttribute('aria-label') && 
        !el.hasAttribute('aria-labelledby') && 
        !el.textContent?.trim()) {
      result.warnings.push(`Interactive element at index ${index} lacks accessible name`);
    }
    
    // Check for proper roles
    if (el.tagName.toLowerCase() === 'div' && el.hasAttribute('onclick') && !el.hasAttribute('role')) {
      result.errors.push(`Clickable div at index ${index} missing role attribute`);
      result.passed = false;
    }
  });

  return result;
}

/**
 * Test ARIA implementation
 * @param container - Container element to test
 * @returns Test result
 */
export function testARIA(container: HTMLElement | null): AccessibilityTestResult {
  const result: AccessibilityTestResult = {
    testName: 'ARIA Implementation',
    passed: true,
    level: 'AA',
    description: 'ARIA labels, roles, and properties must be correctly implemented',
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!container) {
    result.passed = false;
    result.errors.push('Container element not found');
    return result;
  }

  // Check for required landmarks
  const landmarks = {
    main: container.querySelector('main, [role="main"]'),
    banner: container.querySelector('header, [role="banner"]'),
    navigation: container.querySelector('nav, [role="navigation"]'),
    complementary: container.querySelector('aside, [role="complementary"]')
  };

  Object.entries(landmarks).forEach(([landmark, element]) => {
    if (!element) {
      if (landmark === 'main') {
        result.errors.push('Missing main landmark');
        result.passed = false;
      } else {
        result.suggestions.push(`Consider adding ${landmark} landmark`);
      }
    }
  });

  // Check live regions
  const liveRegions = container.querySelectorAll('[aria-live]');
  if (liveRegions.length === 0) {
    result.suggestions.push('Consider adding live regions for dynamic content updates');
  } else {
    liveRegions.forEach((region, index) => {
      const liveValue = region.getAttribute('aria-live');
      if (liveValue && !['polite', 'assertive', 'off'].includes(liveValue)) {
        result.warnings.push(`Live region ${index} has invalid aria-live value: ${liveValue}`);
      }
    });
  }

  // Check form labels
  const formInputs = container.querySelectorAll('input, textarea, select');
  formInputs.forEach((input, index) => {
    const el = input as HTMLElement;
    const id = el.getAttribute('id');
    const ariaLabel = el.getAttribute('aria-label');
    const ariaLabelledby = el.getAttribute('aria-labelledby');
    
    if (id) {
      const label = container.querySelector(`label[for="${id}"]`);
      if (!label && !ariaLabel && !ariaLabelledby) {
        result.warnings.push(`Form input ${index} lacks proper labeling`);
      }
    } else if (!ariaLabel && !ariaLabelledby) {
      result.warnings.push(`Form input ${index} lacks accessible name`);
    }
  });

  return result;
}

/**
 * Test color contrast compliance
 * @returns Test result
 */
export function testColorContrast(): AccessibilityTestResult {
  const result: AccessibilityTestResult = {
    testName: 'Color Contrast',
    passed: true,
    level: 'AA',
    description: 'Text must have sufficient contrast ratio against background',
    errors: [],
    warnings: [],
    suggestions: []
  };

  const validation = validateBettingClubColors();
  
  if (!validation.overallCompliance) {
    validation.combinations.forEach(combo => {
      if (!combo.normal.isCompliant) {
        const message = `${combo.name}: ${combo.normal.ratio?.toFixed(2)} (requires ${combo.normal.required})`;
        if (combo.large.isCompliant) {
          result.warnings.push(`${message} - fails for normal text but passes for large text`);
        } else {
          result.errors.push(`${message} - fails WCAG AA requirements`);
          result.passed = false;
        }
      }
    });
  }

  // Add specific suggestions for betting club colors
  result.suggestions.push('Use white text on red backgrounds for better contrast');
  result.suggestions.push('Use black text on yellow backgrounds');
  result.suggestions.push('Avoid yellow text on white backgrounds');

  return result;
}

/**
 * Test focus management and indicators
 * @param container - Container element to test
 * @returns Test result
 */
export function testFocusManagement(container: HTMLElement | null): AccessibilityTestResult {
  const result: AccessibilityTestResult = {
    testName: 'Focus Management',
    passed: true,
    level: 'AA',
    description: 'Focus indicators must be visible and properly managed',
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!container) {
    result.passed = false;
    result.errors.push('Container element not found');
    return result;
  }

  // Check for focus-visible polyfill or native support
  const hasModernFocusSupport = CSS.supports('selector(:focus-visible)');
  if (!hasModernFocusSupport) {
    result.suggestions.push('Consider using focus-visible polyfill for better focus management');
  }

  // Check focus trap implementation in modals
  const modals = container.querySelectorAll('[role="dialog"], .modal');
  if (modals.length > 0) {
    modals.forEach((modal, index) => {
      if (!modal.hasAttribute('aria-modal')) {
        result.warnings.push(`Modal ${index} missing aria-modal attribute`);
      }
      
      if (!modal.hasAttribute('aria-labelledby') && !modal.hasAttribute('aria-label')) {
        result.warnings.push(`Modal ${index} missing accessible name`);
      }
    });
  }

  // Check for custom focus indicators
  const customFocusElements = container.querySelectorAll('.focus\\:ring, [class*="focus:"]');
  if (customFocusElements.length === 0) {
    result.suggestions.push('Consider implementing custom focus indicators for better visibility');
  }

  return result;
}

/**
 * Test semantic HTML structure
 * @param container - Container element to test
 * @returns Test result
 */
export function testSemanticHTML(container: HTMLElement | null): AccessibilityTestResult {
  const result: AccessibilityTestResult = {
    testName: 'Semantic HTML',
    passed: true,
    level: 'AA',
    description: 'HTML must use semantic elements and proper heading hierarchy',
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!container) {
    result.passed = false;
    result.errors.push('Container element not found');
    return result;
  }

  // Check heading hierarchy
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  if (headings.length === 0) {
    result.warnings.push('No headings found - consider adding headings for better structure');
  } else {
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        result.warnings.push('First heading should be h1');
      }
      
      if (level > previousLevel + 1) {
        result.warnings.push(`Heading level jumps from h${previousLevel} to h${level} - consider proper hierarchy`);
      }
      
      if (!heading.textContent?.trim()) {
        result.errors.push(`Empty heading found: ${heading.tagName}`);
        result.passed = false;
      }
      
      previousLevel = level;
    });
  }

  // Check for list structures
  const lists = container.querySelectorAll('ul, ol, dl');
  lists.forEach((list, index) => {
    const listItems = list.querySelectorAll('li, dt, dd');
    if (listItems.length === 0) {
      result.warnings.push(`Empty list found at index ${index}`);
    }
  });

  // Check for table headers
  const tables = container.querySelectorAll('table');
  tables.forEach((table, index) => {
    const headers = table.querySelectorAll('th');
    if (headers.length === 0) {
      result.errors.push(`Table ${index} missing header cells (th elements)`);
      result.passed = false;
    }
    
    if (!table.hasAttribute('role') && !table.querySelector('caption')) {
      result.suggestions.push(`Table ${index} could benefit from a caption or aria-label`);
    }
  });

  return result;
}

/**
 * Test mobile accessibility features
 * @param container - Container element to test
 * @returns Test result
 */
export function testMobileAccessibility(container: HTMLElement | null): AccessibilityTestResult {
  const result: AccessibilityTestResult = {
    testName: 'Mobile Accessibility',
    passed: true,
    level: 'AA',
    description: 'Touch targets must be appropriately sized and spaced',
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!container) {
    result.passed = false;
    result.errors.push('Container element not found');
    return result;
  }

  // Check touch target sizes
  const interactiveElements = container.querySelectorAll(
    'button, a, input, textarea, select, [role="button"], [onclick]'
  );
  
  interactiveElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // W3C recommendation for touch targets
    
    if (rect.width > 0 && rect.height > 0) {
      if (rect.width < minSize || rect.height < minSize) {
        result.warnings.push(
          `Touch target ${index} is ${Math.round(rect.width)}×${Math.round(rect.height)}px ` +
          `(recommended minimum: ${minSize}×${minSize}px)`
        );
      }
    }
  });

  // Check for proper viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    result.errors.push('Missing viewport meta tag');
    result.passed = false;
  } else {
    const content = viewportMeta.getAttribute('content');
    if (content && content.includes('user-scalable=no')) {
      result.errors.push('Viewport meta tag prevents zoom - removes user control');
      result.passed = false;
    }
  }

  return result;
}

/**
 * Run comprehensive accessibility audit
 * @param container - Container element to audit (defaults to document.body)
 * @returns Complete audit results
 */
export function runAccessibilityAudit(container: HTMLElement | null = document.body): AccessibilityAudit {
  const tests = [
    testKeyboardNavigation,
    testARIA,
    testColorContrast,
    testFocusManagement,
    testSemanticHTML,
    testMobileAccessibility
  ];

  const results = tests.map(test => {
    try {
      if (test === testColorContrast) {
        return test();
      } else {
        return test(container);
      }
    } catch (error) {
      return {
        testName: test.name,
        passed: false,
        level: 'AA' as const,
        description: 'Test execution failed',
        errors: [`Test execution error: ${error}`],
        warnings: [],
        suggestions: []
      };
    }
  });

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const overallScore = Math.round((passedTests / totalTests) * 100);
  
  const summary = {
    critical: results.reduce((sum, r) => sum + r.errors.length, 0),
    warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    suggestions: results.reduce((sum, r) => sum + r.suggestions.length, 0)
  };

  return {
    overallScore,
    passed: passedTests === totalTests && summary.critical === 0,
    totalTests,
    passedTests,
    results,
    summary
  };
}

/**
 * Log accessibility audit results to console
 * @param audit - Audit results to log
 */
export function logAccessibilityAudit(audit: AccessibilityAudit): void {
  const { overallScore, passed, totalTests, passedTests, results, summary } = audit;
  
  console.group(`🔍 Accessibility Audit Results - Score: ${overallScore}/100`);
  
  if (passed) {
    console.log('✅ All accessibility tests passed!');
  } else {
    console.log(`❌ ${totalTests - passedTests}/${totalTests} tests failed`);
  }
  
  console.log(`📊 Summary: ${summary.critical} critical, ${summary.warnings} warnings, ${summary.suggestions} suggestions`);
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.group(`${icon} ${result.testName} (${result.level})`);
    console.log(result.description);
    
    if (result.errors.length > 0) {
      console.error('🚨 Errors:', result.errors);
    }
    
    if (result.warnings.length > 0) {
      console.warn('⚠️ Warnings:', result.warnings);
    }
    
    if (result.suggestions.length > 0) {
      console.info('💡 Suggestions:', result.suggestions);
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
}

/**
 * Export commonly used accessibility testing functions
 */
export const accessibilityTests = {
  keyboard: testKeyboardNavigation,
  aria: testARIA,
  contrast: testColorContrast,
  focus: testFocusManagement,
  semantic: testSemanticHTML,
  mobile: testMobileAccessibility,
  audit: runAccessibilityAudit,
  log: logAccessibilityAudit
};

export default accessibilityTests;
