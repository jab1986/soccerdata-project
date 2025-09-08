import { useCallback, useEffect, useState, useRef } from 'react';

/**
 * Custom hook for keyboard navigation patterns in lists, grids, and complex UI
 * Handles arrow keys, tab navigation, and focus management
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Keyboard navigation utilities
 */
export function useKeyboardNavigation(options = {}) {
  const {
    orientation = 'vertical', // 'horizontal', 'vertical', 'grid'
    wrap = false, // Whether to wrap around at edges
    itemSelector = '[data-keyboard-item]',
    gridColumns = 1, // For grid navigation
    onNavigate = null, // Callback when navigation occurs
    enableArrowKeys = true,
    enableHomeEnd = true,
    enablePageUpDown = false
  } = options;

  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState([]);

  // Update items when container content changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateItems = () => {
      const foundItems = Array.from(
        containerRef.current.querySelectorAll(itemSelector)
      ).filter(item => !item.disabled && !item.hasAttribute('aria-hidden'));
      setItems(foundItems);
      
      // Ensure current index is within bounds
      if (foundItems.length > 0) {
        setCurrentIndex(prev => Math.min(prev, foundItems.length - 1));
      }
    };

    updateItems();

    // Use MutationObserver to watch for changes
    const observer = new MutationObserver(updateItems);
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-hidden']
    });

    return () => observer.disconnect();
  }, [itemSelector]);

  /**
   * Move focus to specific index
   * @param {number} newIndex - Target index
   * @param {boolean} announce - Whether to announce the movement
   */
  const focusItem = useCallback((newIndex, announce = true) => {
    if (newIndex < 0 || newIndex >= items.length) return;

    const targetItem = items[newIndex];
    if (targetItem) {
      targetItem.focus();
      setCurrentIndex(newIndex);

      if (announce && onNavigate) {
        onNavigate({
          index: newIndex,
          item: targetItem,
          total: items.length
        });
      }

      // Announce position for screen readers
      if (announce && items.length > 1) {
        const announcement = `Item ${newIndex + 1} of ${items.length}`;
        // Use a small delay to let focus settle
        setTimeout(() => {
          targetItem.setAttribute('aria-describedby', 'sr-nav-hint');
          const existingHint = document.getElementById('sr-nav-hint');
          if (!existingHint) {
            const hint = document.createElement('div');
            hint.id = 'sr-nav-hint';
            hint.setAttribute('aria-live', 'polite');
            hint.setAttribute('aria-atomic', 'true');
            hint.className = 'sr-only';
            hint.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
            document.body.appendChild(hint);
          }
          const hintElement = document.getElementById('sr-nav-hint');
          hintElement.textContent = announcement;
          
          // Clean up after announcement
          setTimeout(() => {
            if (targetItem) {
              targetItem.removeAttribute('aria-describedby');
            }
          }, 1000);
        }, 100);
      }
    }
  }, [items, onNavigate]);

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = useCallback((event) => {
    if (!items.length) return;

    const { key, ctrlKey, shiftKey, altKey, metaKey } = event;
    
    // Don't handle if modifier keys are pressed (except shift for some cases)
    if (ctrlKey || altKey || metaKey) return;

    let newIndex = currentIndex;
    let handled = false;

    if (enableArrowKeys) {
      switch (key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'grid') {
            if (orientation === 'grid') {
              newIndex = currentIndex + gridColumns;
              if (newIndex >= items.length) {
                newIndex = wrap ? currentIndex % gridColumns : currentIndex;
              }
            } else {
              newIndex = currentIndex + 1;
              if (newIndex >= items.length) {
                newIndex = wrap ? 0 : currentIndex;
              }
            }
            handled = true;
          }
          break;

        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'grid') {
            if (orientation === 'grid') {
              newIndex = currentIndex - gridColumns;
              if (newIndex < 0) {
                if (wrap) {
                  // Find the last item in the same column
                  const column = currentIndex % gridColumns;
                  const lastRowStart = Math.floor((items.length - 1) / gridColumns) * gridColumns;
                  newIndex = Math.min(lastRowStart + column, items.length - 1);
                } else {
                  newIndex = currentIndex;
                }
              }
            } else {
              newIndex = currentIndex - 1;
              if (newIndex < 0) {
                newIndex = wrap ? items.length - 1 : currentIndex;
              }
            }
            handled = true;
          }
          break;

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'grid') {
            if (orientation === 'grid') {
              if ((currentIndex + 1) % gridColumns === 0) {
                // End of row
                newIndex = wrap ? currentIndex - gridColumns + 1 : currentIndex;
              } else {
                newIndex = Math.min(currentIndex + 1, items.length - 1);
              }
            } else {
              newIndex = currentIndex + 1;
              if (newIndex >= items.length) {
                newIndex = wrap ? 0 : currentIndex;
              }
            }
            handled = true;
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'grid') {
            if (orientation === 'grid') {
              if (currentIndex % gridColumns === 0) {
                // Start of row
                newIndex = wrap ? Math.min(currentIndex + gridColumns - 1, items.length - 1) : currentIndex;
              } else {
                newIndex = currentIndex - 1;
              }
            } else {
              newIndex = currentIndex - 1;
              if (newIndex < 0) {
                newIndex = wrap ? items.length - 1 : currentIndex;
              }
            }
            handled = true;
          }
          break;
      }
    }

    if (enableHomeEnd) {
      switch (key) {
        case 'Home':
          newIndex = 0;
          handled = true;
          break;
        case 'End':
          newIndex = items.length - 1;
          handled = true;
          break;
      }
    }

    if (enablePageUpDown) {
      const pageSize = Math.max(1, Math.floor(items.length / 10)); // 10% of items
      switch (key) {
        case 'PageDown':
          newIndex = Math.min(currentIndex + pageSize, items.length - 1);
          handled = true;
          break;
        case 'PageUp':
          newIndex = Math.max(currentIndex - pageSize, 0);
          handled = true;
          break;
      }
    }

    if (handled && newIndex !== currentIndex) {
      event.preventDefault();
      event.stopPropagation();
      focusItem(newIndex);
    }
  }, [currentIndex, items, orientation, wrap, gridColumns, enableArrowKeys, enableHomeEnd, enablePageUpDown, focusItem]);

  /**
   * Focus first item in the list
   */
  const focusFirst = useCallback(() => {
    if (items.length > 0) {
      focusItem(0);
    }
  }, [items, focusItem]);

  /**
   * Focus last item in the list
   */
  const focusLast = useCallback(() => {
    if (items.length > 0) {
      focusItem(items.length - 1);
    }
  }, [items, focusItem]);

  /**
   * Find and focus item by text content
   * @param {string} searchText - Text to search for
   * @param {boolean} startsWith - Whether to match start of text only
   */
  const focusItemByText = useCallback((searchText, startsWith = true) => {
    const searchLower = searchText.toLowerCase();
    const foundIndex = items.findIndex(item => {
      const itemText = item.textContent?.toLowerCase() || '';
      return startsWith ? itemText.startsWith(searchLower) : itemText.includes(searchLower);
    });
    
    if (foundIndex !== -1) {
      focusItem(foundIndex);
      return true;
    }
    return false;
  }, [items, focusItem]);

  /**
   * Get current focused item
   */
  const getCurrentItem = useCallback(() => {
    return items[currentIndex] || null;
  }, [items, currentIndex]);

  return {
    containerRef,
    currentIndex,
    items,
    handleKeyDown,
    focusItem,
    focusFirst,
    focusLast,
    focusItemByText,
    getCurrentItem
  };
}

export default useKeyboardNavigation;
