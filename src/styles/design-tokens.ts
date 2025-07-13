// CODEMA Design Token System
// This file provides TypeScript utilities for accessing design tokens defined in index.css

export interface DesignTokens {
  colors: {
    // Base colors
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    
    // Brand colors (CODEMA - Verde escuro e dourado)
    primary: string;
    primaryForeground: string;
    primaryHover: string;
    primaryGlow: string;
    
    secondary: string;
    secondaryForeground: string;
    secondaryHover: string;
    
    // Semantic colors
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    
    // Interactive elements
    border: string;
    input: string;
    ring: string;
    
    // Sidebar specific
    sidebar: {
      background: string;
      foreground: string;
      primary: string;
      primaryForeground: string;
      accent: string;
      accentForeground: string;
      border: string;
      ring: string;
    };
  };
  
  gradients: {
    primary: string;
    codema: string;
  };
  
  spacing: {
    radius: string;
  };
  
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  
  typography: {
    fontFamily: {
      sans: string[];
      serif: string[];
      mono: string[];
    };
    fontSize: {
      xs: [string, { lineHeight: string }];
      sm: [string, { lineHeight: string }];
      base: [string, { lineHeight: string }];
      lg: [string, { lineHeight: string }];
      xl: [string, { lineHeight: string }];
      '2xl': [string, { lineHeight: string }];
      '3xl': [string, { lineHeight: string }];
      '4xl': [string, { lineHeight: string }];
      '5xl': [string, { lineHeight: string }];
      '6xl': [string, { lineHeight: string }];
      '7xl': [string, { lineHeight: string }];
      '8xl': [string, { lineHeight: string }];
      '9xl': [string, { lineHeight: string }];
    };
    fontWeight: {
      thin: string;
      extralight: string;
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
      extrabold: string;
      black: string;
    };
  };
  
  shadows: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    none: string;
  };
  
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

// Design token definitions
export const designTokens: DesignTokens = {
  colors: {
    // Base colors
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    card: 'hsl(var(--card))',
    cardForeground: 'hsl(var(--card-foreground))',
    popover: 'hsl(var(--popover))',
    popoverForeground: 'hsl(var(--popover-foreground))',
    
    // Brand colors
    primary: 'hsl(var(--primary))',
    primaryForeground: 'hsl(var(--primary-foreground))',
    primaryHover: 'hsl(var(--primary-hover))',
    primaryGlow: 'hsl(var(--primary-glow))',
    
    secondary: 'hsl(var(--secondary))',
    secondaryForeground: 'hsl(var(--secondary-foreground))',
    secondaryHover: 'hsl(var(--secondary-hover))',
    
    // Semantic colors
    muted: 'hsl(var(--muted))',
    mutedForeground: 'hsl(var(--muted-foreground))',
    accent: 'hsl(var(--accent))',
    accentForeground: 'hsl(var(--accent-foreground))',
    destructive: 'hsl(var(--destructive))',
    destructiveForeground: 'hsl(var(--destructive-foreground))',
    
    // Interactive elements
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    
    // Sidebar specific
    sidebar: {
      background: 'hsl(var(--sidebar-background))',
      foreground: 'hsl(var(--sidebar-foreground))',
      primary: 'hsl(var(--sidebar-primary))',
      primaryForeground: 'hsl(var(--sidebar-primary-foreground))',
      accent: 'hsl(var(--sidebar-accent))',
      accentForeground: 'hsl(var(--sidebar-accent-foreground))',
      border: 'hsl(var(--sidebar-border))',
      ring: 'hsl(var(--sidebar-ring))',
    },
  },
  
  gradients: {
    primary: 'var(--gradient-primary)',
    codema: 'var(--gradient-codema)',
  },
  
  spacing: {
    radius: 'var(--radius)',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'Cambria', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// Utility functions for working with design tokens
export class DesignTokenUtils {
  static getColor(colorPath: string): string {
    const paths = colorPath.split('.');
    let current: Record<string, unknown> = designTokens.colors as Record<string, unknown>;
    
    for (const path of paths) {
      if (current[path] && typeof current[path] === 'object') {
        current = current[path] as Record<string, unknown>;
      } else if (typeof current[path] === 'string') {
        return current[path] as string;
      } else {
        console.warn(`Design token not found: colors.${colorPath}`);
        return designTokens.colors.foreground;
      }
    }
    
    return typeof current === 'string' ? current : designTokens.colors.foreground;
  }
  
  static getGradient(gradientName: keyof DesignTokens['gradients']): string {
    return designTokens.gradients[gradientName] || designTokens.gradients.primary;
  }
  
  static getFontSize(size: keyof DesignTokens['typography']['fontSize']): [string, { lineHeight: string }] {
    return designTokens.typography.fontSize[size] || designTokens.typography.fontSize.base;
  }
  
  static getShadow(shadowName: keyof DesignTokens['shadows']): string {
    return designTokens.shadows[shadowName] || designTokens.shadows.none;
  }
  
  static getBreakpoint(breakpoint: keyof DesignTokens['breakpoints']): string {
    return designTokens.breakpoints[breakpoint] || designTokens.breakpoints.md;
  }
  
  static getCSSVariable(variableName: string): string {
    return `var(--${variableName})`;
  }
  
  static getHSLColor(variableName: string): string {
    return `hsl(var(--${variableName}))`;
  }
}

// Theme context types for React components
export interface ThemeContext {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  tokens: DesignTokens;
}

// Responsive design utilities
export const responsive = {
  sm: (styles: string) => `@media (min-width: ${designTokens.breakpoints.sm}) { ${styles} }`,
  md: (styles: string) => `@media (min-width: ${designTokens.breakpoints.md}) { ${styles} }`,
  lg: (styles: string) => `@media (min-width: ${designTokens.breakpoints.lg}) { ${styles} }`,
  xl: (styles: string) => `@media (min-width: ${designTokens.breakpoints.xl}) { ${styles} }`,
  '2xl': (styles: string) => `@media (min-width: ${designTokens.breakpoints['2xl']}) { ${styles} }`,
};

// Accessibility-focused design tokens
export const accessibilityTokens = {
  focus: {
    ring: designTokens.colors.ring,
    ringWidth: '2px',
    ringOffset: '2px',
    outline: 'none',
  },
  motion: {
    duration: 'var(--motion-duration, 150ms)',
    easing: 'var(--motion-easing, cubic-bezier(0.4, 0, 0.2, 1))',
  },
  contrast: {
    minRatio: '4.5:1', // WCAG AA standard
    enhancedRatio: '7:1', // WCAG AAA standard
  },
  touch: {
    minTarget: '44px', // Minimum touch target size
    spacing: '8px', // Minimum spacing between touch targets
  },
};

// Component-specific token sets
export const componentTokens = {
  navigation: {
    height: '64px',
    sidebarWidth: '280px',
    sidebarCollapsedWidth: '64px',
    zIndex: '40',
    itemPadding: '0.75rem',
    itemGap: '0.5rem',
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
    borderRadius: designTokens.spacing.radius,
  },
  
  form: {
    inputHeight: '2.5rem',
    inputPadding: '0.75rem',
    labelSpacing: '0.5rem',
    fieldSpacing: '1rem',
    borderRadius: designTokens.spacing.radius,
  },
  
  card: {
    padding: '1.5rem',
    borderRadius: designTokens.spacing.radius,
    shadow: designTokens.shadows.base,
  },
};

// Export commonly used token combinations
export const tokenCombinations = {
  button: {
    primary: {
      background: designTokens.colors.primary,
      foreground: designTokens.colors.primaryForeground,
      hover: designTokens.colors.primaryHover,
    },
    secondary: {
      background: designTokens.colors.secondary,
      foreground: designTokens.colors.secondaryForeground,
      hover: designTokens.colors.secondaryHover,
    },
    destructive: {
      background: designTokens.colors.destructive,
      foreground: designTokens.colors.destructiveForeground,
      hover: designTokens.colors.destructive,
    },
  },
  
  navigation: {
    sidebar: {
      background: designTokens.colors.sidebar.background,
      foreground: designTokens.colors.sidebar.foreground,
      accent: designTokens.colors.sidebar.accent,
      accentForeground: designTokens.colors.sidebar.accentForeground,
      border: designTokens.colors.sidebar.border,
    },
  },
};

// Default export for easy importing
export default designTokens;