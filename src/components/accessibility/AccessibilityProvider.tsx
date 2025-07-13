import React, { createContext, useContext, useEffect, useState } from 'react';
import { FocusManager } from './FocusManager';
import { ScreenReaderAnnouncer, useScreenReaderDetection, useScreenReaderAnnouncer } from './ScreenReaderAnnouncer';

interface AccessibilityContextValue {
  // Screen reader detection
  screenReader: string | null;
  isLikelyUsingScreenReader: boolean;
  hasHighContrast: boolean;
  hasReducedMotion: boolean;
  
  // Accessibility preferences
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersLargeText: boolean;
  
  // Announcement utilities
  announce: ReturnType<typeof useScreenReaderAnnouncer>['announce'];
  announceNavigation: ReturnType<typeof useScreenReaderAnnouncer>['announceNavigation'];
  announceError: ReturnType<typeof useScreenReaderAnnouncer>['announceError'];
  announceSuccess: ReturnType<typeof useScreenReaderAnnouncer>['announceSuccess'];
  announceLoading: ReturnType<typeof useScreenReaderAnnouncer>['announceLoading'];
  
  // Keyboard shortcuts
  keyboardShortcuts: Map<string, () => void>;
  registerShortcut: (key: string, callback: () => void) => void;
  unregisterShortcut: (key: string) => void;
  
  // Focus management
  focusFirstElement: () => boolean;
  focusLastElement: () => boolean;
  trapFocus: boolean;
  setTrapFocus: (trap: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

interface AccessibilityProviderProps {
  children: React.ReactNode;
  enableKeyboardShortcuts?: boolean;
  enableFocusTrapping?: boolean;
  enableScreenReaderAnnouncements?: boolean;
}

export function AccessibilityProvider({
  children,
  enableKeyboardShortcuts = true,
  enableFocusTrapping = false,
  enableScreenReaderAnnouncements = true
}: AccessibilityProviderProps) {
  const [trapFocus, setTrapFocus] = useState(enableFocusTrapping);
  const [keyboardShortcuts] = useState(new Map<string, () => void>());
  
  // Screen reader detection and announcements
  const screenReaderDetection = useScreenReaderDetection();
  const announcer = useScreenReaderAnnouncer();
  
  // Accessibility preferences detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [prefersLargeText, setPrefersLargeText] = useState(false);
  
  // Focus management ref
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Monitor accessibility preferences
  useEffect(() => {
    const updatePreferences = () => {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      setPrefersHighContrast(window.matchMedia('(prefers-contrast: high)').matches);
      setPrefersLargeText(window.matchMedia('(prefers-font-size: large)').matches);
    };
    
    updatePreferences();
    
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const largeTextQuery = window.matchMedia('(prefers-font-size: large)');
    
    reducedMotionQuery.addEventListener('change', updatePreferences);
    highContrastQuery.addEventListener('change', updatePreferences);
    largeTextQuery.addEventListener('change', updatePreferences);
    
    return () => {
      reducedMotionQuery.removeEventListener('change', updatePreferences);
      highContrastQuery.removeEventListener('change', updatePreferences);
      largeTextQuery.removeEventListener('change', updatePreferences);
    };
  }, []);
  
  // Keyboard shortcut management
  const registerShortcut = React.useCallback((key: string, callback: () => void) => {
    keyboardShortcuts.set(key, callback);
  }, [keyboardShortcuts]);
  
  const unregisterShortcut = React.useCallback((key: string) => {
    keyboardShortcuts.delete(key);
  }, [keyboardShortcuts]);
  
  // Global keyboard shortcut handler
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Create key combination string
      const keys = [];
      if (event.ctrlKey) keys.push('Ctrl');
      if (event.shiftKey) keys.push('Shift');
      if (event.altKey) keys.push('Alt');
      if (event.metaKey) keys.push('Meta');
      keys.push(event.key);
      
      const keyCombo = keys.join('+');
      const callback = keyboardShortcuts.get(keyCombo);
      
      if (callback) {
        event.preventDefault();
        callback();
        
        // Announce shortcut usage
        if (enableScreenReaderAnnouncements) {
          announcer.announceKeyboardShortcut(keyCombo, 'executado');
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, keyboardShortcuts, announcer, enableScreenReaderAnnouncements]);
  
  // Focus management utilities
  const focusFirstElement = React.useCallback(() => {
    if (containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
        return true;
      }
    }
    return false;
  }, []);
  
  const focusLastElement = React.useCallback(() => {
    if (containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      if (lastElement) {
        lastElement.focus();
        return true;
      }
    }
    return false;
  }, []);
  
  // Register default keyboard shortcuts
  useEffect(() => {
    if (enableKeyboardShortcuts) {
      // Navigation shortcuts
      registerShortcut('Alt+1', () => {
        const homeLink = document.querySelector('a[href="/"], a[href="#home"]') as HTMLElement;
        homeLink?.click();
      });
      
      registerShortcut('Alt+M', () => {
        const mainContent = document.getElementById('main-content') as HTMLElement;
        mainContent?.focus();
      });
      
      registerShortcut('Alt+N', () => {
        const navigation = document.querySelector('[role="navigation"]') as HTMLElement;
        navigation?.focus();
      });
      
      registerShortcut('Alt+S', () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="busca"], input[placeholder*="pesquisa"]') as HTMLElement;
        searchInput?.focus();
      });
      
      // Accessibility shortcuts
      registerShortcut('Alt+H', () => {
        focusFirstElement();
      });
      
      registerShortcut('Alt+E', () => {
        focusLastElement();
      });
      
      registerShortcut('Escape', () => {
        // Close any open dialogs or menus
        const closeButtons = document.querySelectorAll('[aria-label*="fechar"], [aria-label*="close"], .close-button');
        const lastCloseButton = closeButtons[closeButtons.length - 1] as HTMLElement;
        lastCloseButton?.click();
      });
    }
  }, [enableKeyboardShortcuts, registerShortcut, focusFirstElement, focusLastElement]);
  
  // Context value
  const contextValue: AccessibilityContextValue = {
    // Screen reader detection
    screenReader: screenReaderDetection.screenReader,
    isLikelyUsingScreenReader: screenReaderDetection.isLikelyUsingScreenReader,
    hasHighContrast: screenReaderDetection.hasHighContrast,
    hasReducedMotion: screenReaderDetection.hasReducedMotion,
    
    // Accessibility preferences
    prefersReducedMotion,
    prefersHighContrast,
    prefersLargeText,
    
    // Announcement utilities
    announce: announcer.announce,
    announceNavigation: announcer.announceNavigation,
    announceError: announcer.announceError,
    announceSuccess: announcer.announceSuccess,
    announceLoading: announcer.announceLoading,
    
    // Keyboard shortcuts
    keyboardShortcuts,
    registerShortcut,
    unregisterShortcut,
    
    // Focus management
    focusFirstElement,
    focusLastElement,
    trapFocus,
    setTrapFocus
  };
  
  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div ref={containerRef} className="accessibility-container">
        <FocusManager
          trapFocus={trapFocus}
          skipLinks={true}
        >
          {enableScreenReaderAnnouncements && <announcer.AnnouncementRegions />}
          {children}
        </FocusManager>
      </div>
    </AccessibilityContext.Provider>
  );
}

// Hook to use accessibility context
export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
}

// Convenience hooks for specific accessibility features
export function useScreenReaderSupport() {
  const { screenReader, isLikelyUsingScreenReader, announce, announceNavigation, announceError, announceSuccess, announceLoading } = useAccessibility();
  
  return {
    screenReader,
    isLikelyUsingScreenReader,
    announce,
    announceNavigation,
    announceError,
    announceSuccess,
    announceLoading
  };
}

export function useKeyboardShortcuts() {
  const { keyboardShortcuts, registerShortcut, unregisterShortcut } = useAccessibility();
  
  return {
    shortcuts: keyboardShortcuts,
    register: registerShortcut,
    unregister: unregisterShortcut
  };
}

export function useFocusManagement() {
  const { focusFirstElement, focusLastElement, trapFocus, setTrapFocus } = useAccessibility();
  
  return {
    focusFirst: focusFirstElement,
    focusLast: focusLastElement,
    trapFocus,
    setTrapFocus
  };
}

export function useAccessibilityPreferences() {
  const { prefersReducedMotion, prefersHighContrast, prefersLargeText, hasHighContrast, hasReducedMotion } = useAccessibility();
  
  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersLargeText,
    hasHighContrast,
    hasReducedMotion
  };
}

// HOC for adding accessibility features to components
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>
) {
  const AccessibleComponent = (props: P) => {
    const accessibility = useAccessibility();
    
    return (
      <Component
        {...props}
        accessibility={accessibility}
      />
    );
  };
  
  AccessibleComponent.displayName = `withAccessibility(${Component.displayName || Component.name})`;
  
  return AccessibleComponent;
}

// Utility function to check if user prefers reduced animations
export function shouldReduceAnimations(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
}

// Utility function to check if user is using high contrast mode
export function isHighContrastMode(): boolean {
  return window.matchMedia?.('(prefers-contrast: high)').matches || false;
}

// Utility function to announce route changes
export function announceRouteChange(routeName: string, delay = 100) {
  setTimeout(() => {
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Página atual: ${routeName}`, { priority: 'polite' });
    }
  }, delay);
}