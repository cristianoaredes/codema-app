import React, { useRef, useCallback, useEffect } from 'react';

// Extend Window interface for screen reader announcements
declare global {
  interface Window {
    announceToScreenReader?: (message: string, options?: AnnouncementOptions) => void;
  }
}

interface AnnouncementOptions {
  priority?: 'polite' | 'assertive';
  delay?: number;
  clear?: boolean;
}

interface ScreenReaderAnnouncerProps {
  className?: string;
}

export function ScreenReaderAnnouncer({ className }: ScreenReaderAnnouncerProps) {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((
    message: string, 
    options: AnnouncementOptions = {}
  ) => {
    const { 
      priority = 'polite', 
      delay = 0, 
      clear = true 
    } = options;

    const targetRef = priority === 'assertive' ? assertiveRef : politeRef;
    
    if (!targetRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const announceMessage = () => {
      if (targetRef.current) {
        // Clear previous message if requested
        if (clear) {
          targetRef.current.textContent = '';
          // Force a reflow to ensure the clearing is processed
          void targetRef.current.offsetHeight;
        }
        
        // Set the new message
        targetRef.current.textContent = message;
        
        // Clear the message after a delay to allow for re-announcement
        setTimeout(() => {
          if (targetRef.current) {
            targetRef.current.textContent = '';
          }
        }, 1000);
      }
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(announceMessage, delay);
    } else {
      announceMessage();
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Expose announce function globally for easy access
  useEffect(() => {
    window.announceToScreenReader = announce;
    
    return () => {
      delete window.announceToScreenReader;
    };
  }, [announce]);

  return (
    <div className={className}>
      {/* Polite announcements - won't interrupt current speech */}
      <div
        ref={politeRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      
      {/* Assertive announcements - will interrupt current speech */}
      <div
        ref={assertiveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />
    </div>
  );
}

// Hook for using screen reader announcements
export function useScreenReaderAnnouncer() {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((
    message: string, 
    options: AnnouncementOptions = {}
  ) => {
    const { 
      priority = 'polite', 
      delay = 0, 
      clear = true 
    } = options;

    const targetRef = priority === 'assertive' ? assertiveRef : politeRef;
    
    if (!targetRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const announceMessage = () => {
      if (targetRef.current) {
        if (clear) {
          targetRef.current.textContent = '';
          void targetRef.current.offsetHeight; // Force reflow
        }
        
        targetRef.current.textContent = message;
        
        // Clear after delay
        setTimeout(() => {
          if (targetRef.current) {
            targetRef.current.textContent = '';
          }
        }, 1000);
      }
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(announceMessage, delay);
    } else {
      announceMessage();
    }
  }, []);

  // Specialized announcement functions
  const announceNavigation = useCallback((destination: string) => {
    announce(`Navegando para ${destination}`, { priority: 'polite' });
  }, [announce]);

  const announceError = useCallback((error: string) => {
    announce(`Erro: ${error}`, { priority: 'assertive' });
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Sucesso: ${message}`, { priority: 'polite' });
  }, [announce]);

  const announceLoading = useCallback((isLoading: boolean, message?: string) => {
    if (isLoading) {
      announce(message || 'Carregando...', { priority: 'polite' });
    } else {
      announce('Carregamento concluído', { priority: 'polite' });
    }
  }, [announce]);

  const announcePageChange = useCallback((pageTitle: string) => {
    announce(`Página atual: ${pageTitle}`, { priority: 'polite', delay: 500 });
  }, [announce]);

  const announceMenuState = useCallback((isOpen: boolean, menuName: string) => {
    const state = isOpen ? 'expandido' : 'recolhido';
    announce(`Menu ${menuName} ${state}`, { priority: 'polite' });
  }, [announce]);

  const announceFormValidation = useCallback((field: string, error: string) => {
    announce(`Campo ${field}: ${error}`, { priority: 'assertive' });
  }, [announce]);

  const announceKeyboardShortcut = useCallback((shortcut: string, action: string) => {
    announce(`Atalho ${shortcut}: ${action}`, { priority: 'polite' });
  }, [announce]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Component for rendering the announcement regions
  const AnnouncementRegions = useCallback(() => (
    <>
      <div
        ref={politeRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      <div
        ref={assertiveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />
    </>
  ), []);

  return {
    announce,
    announceNavigation,
    announceError,
    announceSuccess,
    announceLoading,
    announcePageChange,
    announceMenuState,
    announceFormValidation,
    announceKeyboardShortcut,
    AnnouncementRegions
  };
}

// Global announcement utility
export const globalAnnounce = {
  navigation: (destination: string) => {
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Navegando para ${destination}`, { priority: 'polite' });
    }
  },
  
  error: (error: string) => {
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Erro: ${error}`, { priority: 'assertive' });
    }
  },
  
  success: (message: string) => {
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Sucesso: ${message}`, { priority: 'polite' });
    }
  },
  
  loading: (isLoading: boolean, message?: string) => {
    if (window.announceToScreenReader) {
      if (isLoading) {
        window.announceToScreenReader(message || 'Carregando...', { priority: 'polite' });
      } else {
        window.announceToScreenReader('Carregamento concluído', { priority: 'polite' });
      }
    }
  },
  
  pageChange: (pageTitle: string) => {
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Página atual: ${pageTitle}`, { 
        priority: 'polite', 
        delay: 500 
      });
    }
  },
  
  menuState: (isOpen: boolean, menuName: string) => {
    if (window.announceToScreenReader) {
      const state = isOpen ? 'expandido' : 'recolhido';
      window.announceToScreenReader(`Menu ${menuName} ${state}`, { priority: 'polite' });
    }
  },
  
  keyboardShortcut: (shortcut: string, action: string) => {
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Atalho ${shortcut}: ${action}`, { priority: 'polite' });
    }
  }
};

// Screen reader detection utility
export function detectScreenReader(): string | null {
  if (typeof window === 'undefined') return null;

  const userAgent = window.navigator.userAgent;
  
  // Check for common screen readers
  if (userAgent.includes('NVDA')) return 'NVDA';
  if (userAgent.includes('JAWS')) return 'JAWS';
  if (userAgent.includes('VoiceOver')) return 'VoiceOver';
  if (userAgent.includes('TalkBack')) return 'TalkBack';
  if (userAgent.includes('Orca')) return 'Orca';
  
  // Check for high contrast mode (often indicates screen reader use)
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    return 'Unknown Screen Reader (High Contrast Mode)';
  }
  
  // Check for reduced motion (accessibility preference)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'Accessibility Mode Detected';
  }
  
  return null;
}

// Hook to detect if screen reader is likely being used
export function useScreenReaderDetection() {
  const [screenReader, setScreenReader] = React.useState<string | null>(null);
  const [isLikelyUsingScreenReader, setIsLikelyUsingScreenReader] = React.useState(false);

  useEffect(() => {
    const detectedScreenReader = detectScreenReader();
    setScreenReader(detectedScreenReader);
    setIsLikelyUsingScreenReader(!!detectedScreenReader);

    // Listen for accessibility preference changes
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleAccessibilityChange = () => {
      const hasAccessibilityPreferences = 
        highContrastQuery.matches || reducedMotionQuery.matches;
      setIsLikelyUsingScreenReader(!!detectedScreenReader || hasAccessibilityPreferences);
    };

    highContrastQuery.addEventListener('change', handleAccessibilityChange);
    reducedMotionQuery.addEventListener('change', handleAccessibilityChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleAccessibilityChange);
      reducedMotionQuery.removeEventListener('change', handleAccessibilityChange);
    };
  }, []);

  return {
    screenReader,
    isLikelyUsingScreenReader,
    hasHighContrast: window.matchMedia?.('(prefers-contrast: high)').matches || false,
    hasReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
  };
}