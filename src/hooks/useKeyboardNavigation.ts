import React, { useEffect, useCallback, useRef } from 'react';
import { NavigationItem } from '@/types/navigation';

interface UseKeyboardNavigationProps {
  items: NavigationItem[];
  onItemSelect: (item: NavigationItem) => void;
  onSectionToggle?: (sectionId: string) => void;
  focusedItemId?: string;
  onFocusChange: (itemId: string | undefined) => void;
  isEnabled?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

export function useKeyboardNavigation({
  items,
  onItemSelect,
  onSectionToggle,
  focusedItemId,
  onFocusChange,
  isEnabled = true,
  containerRef
}: UseKeyboardNavigationProps) {
  const announceRef = useRef<HTMLDivElement>(null);
  const focusedIndexRef = useRef<number>(-1);

  // Get navigable items (excluding disabled items)
  const navigableItems = items.filter(item => !item.isDisabled);

  // Find current focused index
  const getCurrentFocusedIndex = useCallback(() => {
    if (!focusedItemId) return -1;
    return navigableItems.findIndex(item => item.id === focusedItemId);
  }, [focusedItemId, navigableItems]);

  // Update focused index when focusedItemId changes
  useEffect(() => {
    focusedIndexRef.current = getCurrentFocusedIndex();
  }, [getCurrentFocusedIndex]);

  // Announce to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
      // Clear after a short delay to allow for re-announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  // Move focus to next item
  const focusNext = useCallback(() => {
    const currentIndex = focusedIndexRef.current;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < navigableItems.length) {
      const nextItem = navigableItems[nextIndex];
      onFocusChange(nextItem.id);
      announceToScreenReader(`${nextItem.label}${nextItem.description ? `, ${nextItem.description}` : ''}`);
      focusedIndexRef.current = nextIndex;
    }
  }, [navigableItems, onFocusChange, announceToScreenReader]);

  // Move focus to previous item
  const focusPrevious = useCallback(() => {
    const currentIndex = focusedIndexRef.current;
    const prevIndex = currentIndex - 1;
    
    if (prevIndex >= 0) {
      const prevItem = navigableItems[prevIndex];
      onFocusChange(prevItem.id);
      announceToScreenReader(`${prevItem.label}${prevItem.description ? `, ${prevItem.description}` : ''}`);
      focusedIndexRef.current = prevIndex;
    }
  }, [navigableItems, onFocusChange, announceToScreenReader]);

  // Move focus to first item
  const focusFirst = useCallback(() => {
    if (navigableItems.length > 0) {
      const firstItem = navigableItems[0];
      onFocusChange(firstItem.id);
      announceToScreenReader(`Primeiro item: ${firstItem.label}`);
      focusedIndexRef.current = 0;
    }
  }, [navigableItems, onFocusChange, announceToScreenReader]);

  // Move focus to last item
  const focusLast = useCallback(() => {
    if (navigableItems.length > 0) {
      const lastIndex = navigableItems.length - 1;
      const lastItem = navigableItems[lastIndex];
      onFocusChange(lastItem.id);
      announceToScreenReader(`Último item: ${lastItem.label}`);
      focusedIndexRef.current = lastIndex;
    }
  }, [navigableItems, onFocusChange, announceToScreenReader]);

  // Select current item
  const selectCurrent = useCallback(() => {
    if (focusedItemId) {
      const item = navigableItems.find(item => item.id === focusedItemId);
      if (item) {
        onItemSelect(item);
        announceToScreenReader(`Navegando para ${item.label}`);
      }
    }
  }, [focusedItemId, navigableItems, onItemSelect, announceToScreenReader]);

  // Toggle current section (if applicable)
  const toggleCurrentSection = useCallback(() => {
    if (focusedItemId && onSectionToggle) {
      const item = navigableItems.find(item => item.id === focusedItemId);
      if (item && item.children && item.children.length > 0) {
        onSectionToggle(item.id);
        announceToScreenReader(`Seção ${item.label} expandida/recolhida`);
      }
    }
  }, [focusedItemId, navigableItems, onSectionToggle, announceToScreenReader]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Check if focus is within navigation container
    const container = containerRef?.current;
    if (container && !container.contains(event.target as Node)) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusNext();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        focusPrevious();
        break;
      
      case 'Home':
        event.preventDefault();
        focusFirst();
        break;
      
      case 'End':
        event.preventDefault();
        focusLast();
        break;
      
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectCurrent();
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        toggleCurrentSection();
        break;
      
      case 'ArrowLeft':
        event.preventDefault();
        toggleCurrentSection();
        break;
      
      case 'Escape':
        event.preventDefault();
        onFocusChange(undefined);
        announceToScreenReader('Navegação cancelada');
        break;
    }

    // Handle Alt + Number shortcuts
    if (event.altKey && event.key >= '1' && event.key <= '9') {
      event.preventDefault();
      const shortcutIndex = parseInt(event.key) - 1;
      if (shortcutIndex < navigableItems.length) {
        const item = navigableItems[shortcutIndex];
        onItemSelect(item);
        announceToScreenReader(`Atalho usado: ${item.label}`);
      }
    }
  }, [
    isEnabled,
    containerRef,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    selectCurrent,
    toggleCurrentSection,
    onFocusChange,
    announceToScreenReader,
    navigableItems,
    onItemSelect
  ]);

  // Set up event listeners
  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, isEnabled]);

  // Initialize focus on first item when navigation becomes enabled
  useEffect(() => {
    if (isEnabled && !focusedItemId && navigableItems.length > 0) {
      onFocusChange(navigableItems[0].id);
    }
  }, [isEnabled, focusedItemId, navigableItems, onFocusChange]);

  // Screen reader announcer component
  const ScreenReaderAnnouncer = () => {
    return React.createElement('div', {
      ref: announceRef,
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only',
      role: 'status'
    });
  };

  return {
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    selectCurrent,
    toggleCurrentSection,
    handleKeyDown,
    ScreenReaderAnnouncer,
    navigableItems,
    currentFocusedIndex: focusedIndexRef.current,
    announceToScreenReader
  };
}