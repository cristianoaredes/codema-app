import { useCallback, useEffect, useState } from 'react';
import { designTokens, DesignTokens, DesignTokenUtils } from '@/styles/design-tokens';

// Theme preference type
export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// Hook for accessing design tokens with theme support
export function useDesignTokens() {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Get system theme preference
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Resolve theme based on preference
  const resolveTheme = useCallback((themePreference: ThemePreference): ResolvedTheme => {
    if (themePreference === 'system') {
      return getSystemTheme();
    }
    return themePreference;
  }, [getSystemTheme]);

  // Set theme and update DOM
  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);

    // Update DOM class
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    // Store preference
    localStorage.setItem('codema-theme', newTheme);
  }, [resolveTheme]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('codema-theme') as ThemePreference;
    const initialTheme = stored || 'system';
    setTheme(initialTheme);
  }, [setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newResolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, getSystemTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    tokens: designTokens,
    utils: DesignTokenUtils,
  };
}

// Hook for accessing specific color tokens
export function useColorTokens() {
  const { tokens, utils } = useDesignTokens();

  const getColor = useCallback((colorPath: string) => {
    return utils.getColor(colorPath);
  }, [utils]);

  return {
    colors: tokens.colors,
    getColor,
    // Convenience methods for common colors
    primary: tokens.colors.primary,
    secondary: tokens.colors.secondary,
    background: tokens.colors.background,
    foreground: tokens.colors.foreground,
    muted: tokens.colors.muted,
    accent: tokens.colors.accent,
    destructive: tokens.colors.destructive,
    border: tokens.colors.border,
  };
}

// Hook for responsive design tokens
export function useResponsiveTokens() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof DesignTokens['breakpoints']>('md');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 640) setCurrentBreakpoint('sm');
      else if (width < 768) setCurrentBreakpoint('md');
      else if (width < 1024) setCurrentBreakpoint('lg');
      else if (width < 1280) setCurrentBreakpoint('xl');
      else setCurrentBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    currentBreakpoint,
    breakpoints: designTokens.breakpoints,
    isMobile: currentBreakpoint === 'sm',
    isTablet: currentBreakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(currentBreakpoint),
  };
}

// Hook for typography tokens
export function useTypographyTokens() {
  const { tokens } = useDesignTokens();

  const getFontSize = useCallback((size: keyof DesignTokens['typography']['fontSize']) => {
    return tokens.typography.fontSize[size];
  }, [tokens]);

  const getFontWeight = useCallback((weight: keyof DesignTokens['typography']['fontWeight']) => {
    return tokens.typography.fontWeight[weight];
  }, [tokens]);

  return {
    typography: tokens.typography,
    getFontSize,
    getFontWeight,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize,
    fontWeight: tokens.typography.fontWeight,
  };
}

// Hook for animation tokens with reduced motion support
export function useAnimationTokens() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const getDuration = useCallback((speed: keyof DesignTokens['animation']['duration']) => {
    if (prefersReducedMotion) return '0ms';
    return designTokens.animation.duration[speed];
  }, [prefersReducedMotion]);

  const getEasing = useCallback((type: keyof DesignTokens['animation']['easing']) => {
    return designTokens.animation.easing[type];
  }, []);

  return {
    prefersReducedMotion,
    getDuration,
    getEasing,
    duration: designTokens.animation.duration,
    easing: designTokens.animation.easing,
  };
}

// Hook for component-specific tokens
export function useComponentTokens() {
  const { tokens } = useDesignTokens();

  return {
    navigation: {
      height: '64px',
      sidebarWidth: '280px',
      sidebarCollapsedWidth: '64px',
      zIndex: 40,
    },
    button: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      padding: {
        sm: '0.5rem 0.75rem',
        md: '0.75rem 1rem',
        lg: '1rem 1.5rem',
      },
    },
    form: {
      inputHeight: '2.5rem',
      inputPadding: '0.75rem',
      labelSpacing: '0.5rem',
      fieldSpacing: '1rem',
    },
    card: {
      padding: '1.5rem',
      borderRadius: tokens.spacing.radius,
      shadow: tokens.shadows.base,
    },
  };
}

// Custom hook for CSS custom properties
export function useCSSCustomProperties() {
  const getCSSVar = useCallback((property: string, fallback?: string) => {
    if (typeof window === 'undefined') return fallback || '';
    
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${property}`)
      .trim();
    
    return value || fallback || '';
  }, []);

  const setCSSVar = useCallback((property: string, value: string) => {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty(`--${property}`, value);
  }, []);

  return {
    getCSSVar,
    setCSSVar,
  };
}

// Hook for theme-aware styles
export function useThemeAwareStyles() {
  const { resolvedTheme } = useDesignTokens();

  const getThemeValue = useCallback(<T>(lightValue: T, darkValue: T): T => {
    return resolvedTheme === 'dark' ? darkValue : lightValue;
  }, [resolvedTheme]);

  return {
    resolvedTheme,
    getThemeValue,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
}

// Utility hook for creating theme-aware CSS classes
export function useThemeClasses() {
  const { resolvedTheme } = useDesignTokens();

  const themeClass = useCallback((baseClass: string, darkClass?: string) => {
    if (!darkClass) return baseClass;
    return resolvedTheme === 'dark' ? `${baseClass} ${darkClass}` : baseClass;
  }, [resolvedTheme]);

  return {
    themeClass,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
}

// Hook for accessibility-aware design tokens
export function useAccessibilityTokens() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setPrefersHighContrast(highContrastQuery.matches);
    setPrefersReducedMotion(reducedMotionQuery.matches);

    const handleHighContrastChange = () => setPrefersHighContrast(highContrastQuery.matches);
    const handleReducedMotionChange = () => setPrefersReducedMotion(reducedMotionQuery.matches);

    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return {
    prefersHighContrast,
    prefersReducedMotion,
    focus: {
      ring: designTokens.colors.ring,
      ringWidth: prefersHighContrast ? '3px' : '2px',
      ringOffset: '2px',
    },
    motion: {
      duration: prefersReducedMotion ? '0ms' : designTokens.animation.duration.normal,
      easing: designTokens.animation.easing.ease,
    },
    contrast: {
      minRatio: prefersHighContrast ? '7:1' : '4.5:1',
    },
  };
}