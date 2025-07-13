import React, { useRef, useEffect, useCallback } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  trapFocus?: boolean;
  skipLinks?: boolean;
  className?: string;
}

interface FocusableElement extends HTMLElement {
  focus(): void;
}

export function FocusManager({
  children,
  restoreFocus = true,
  autoFocus = false,
  trapFocus = false,
  skipLinks = true,
  className
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<Element | null>(null);
  const skipLinksRef = useRef<HTMLDivElement>(null);

  // Store the previously focused element
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElementRef.current = document.activeElement;
    }

    return () => {
      // Restore focus when component unmounts
      if (restoreFocus && previousActiveElementRef.current) {
        (previousActiveElementRef.current as FocusableElement).focus?.();
      }
    };
  }, [restoreFocus]);

  // Auto focus the first focusable element
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [autoFocus]);

  // Get all focusable elements within a container
  const getFocusableElements = useCallback((container: HTMLElement): FocusableElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter((element): element is FocusableElement => {
        const htmlElement = element as HTMLElement;
        return !htmlElement.hasAttribute('disabled') && 
               htmlElement.tabIndex !== -1 &&
               htmlElement.offsetParent !== null; // Check if element is visible
      });
  }, []);

  // Handle focus trapping
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || !containerRef.current) return;

    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements(containerRef.current);
      
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentElement = document.activeElement as FocusableElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (currentElement === firstElement || !focusableElements.includes(currentElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (currentElement === lastElement || !focusableElements.includes(currentElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    // Handle Escape key to exit focus trap
    if (event.key === 'Escape' && trapFocus) {
      if (restoreFocus && previousActiveElementRef.current) {
        (previousActiveElementRef.current as FocusableElement).focus?.();
      }
    }
  }, [trapFocus, restoreFocus, getFocusableElements]);

  // Set up focus trap event listener
  useEffect(() => {
    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [trapFocus, handleKeyDown]);

  // Focus management utilities
  const focusFirstElement = useCallback(() => {
    if (containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
        return true;
      }
    }
    return false;
  }, [getFocusableElements]);

  const focusLastElement = useCallback(() => {
    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      const lastFocusable = focusableElements[focusableElements.length - 1];
      if (lastFocusable) {
        lastFocusable.focus();
        return true;
      }
    }
    return false;
  }, [getFocusableElements]);

  const focusElement = useCallback((selector: string) => {
    if (containerRef.current) {
      const element = containerRef.current.querySelector(selector) as FocusableElement;
      if (element && getFocusableElements(containerRef.current).includes(element)) {
        element.focus();
        return true;
      }
    }
    return false;
  }, [getFocusableElements]);

  // Skip links for keyboard navigation
  const skipLinksContent = skipLinks && (
    <div
      ref={skipLinksRef}
      className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-50 bg-background border border-border rounded-md p-2"
    >
      <button
        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={focusFirstElement}
      >
        Ir para o primeiro item
      </button>
      <button
        className="ml-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={focusLastElement}
      >
        Ir para o último item
      </button>
    </div>
  );

  return (
    <>
      {skipLinksContent}
      <div
        ref={containerRef}
        className={className}
        role={trapFocus ? 'dialog' : undefined}
        aria-modal={trapFocus}
      >
        {children}
      </div>
    </>
  );
}

// Hook for using focus management utilities
export function useFocusManager(containerRef?: React.RefObject<HTMLElement>) {
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter((element): element is HTMLElement => {
        const htmlElement = element as HTMLElement;
        return !htmlElement.hasAttribute('disabled') && 
               htmlElement.tabIndex !== -1 &&
               htmlElement.offsetParent !== null;
      });
  }, []);

  const focusFirst = useCallback(() => {
    const container = containerRef?.current || document.body;
    const firstFocusable = getFocusableElements(container)[0];
    if (firstFocusable) {
      firstFocusable.focus();
      return true;
    }
    return false;
  }, [containerRef, getFocusableElements]);

  const focusLast = useCallback(() => {
    const container = containerRef?.current || document.body;
    const focusableElements = getFocusableElements(container);
    const lastFocusable = focusableElements[focusableElements.length - 1];
    if (lastFocusable) {
      lastFocusable.focus();
      return true;
    }
    return false;
  }, [containerRef, getFocusableElements]);

  const focusNext = useCallback((currentElement?: HTMLElement) => {
    const container = containerRef?.current || document.body;
    const focusableElements = getFocusableElements(container);
    const current = currentElement || document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(current);
    
    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
      return true;
    }
    return false;
  }, [containerRef, getFocusableElements]);

  const focusPrevious = useCallback((currentElement?: HTMLElement) => {
    const container = containerRef?.current || document.body;
    const focusableElements = getFocusableElements(container);
    const current = currentElement || document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(current);
    
    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
      return true;
    }
    return false;
  }, [containerRef, getFocusableElements]);

  return {
    getFocusableElements: useCallback((container?: HTMLElement) => 
      getFocusableElements(container || containerRef?.current || document.body), 
      [getFocusableElements, containerRef]
    ),
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious
  };
}