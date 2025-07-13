// Navigation Types and Interfaces for CODEMA Application
// This file defines the core navigation structure with accessibility and role-based access

export type UserRole = 'admin' | 'secretario' | 'presidente' | 'conselheiro_titular' | 'conselheiro_suplente' | 'user';

export type NavigationVariant = 'horizontal' | 'sidebar' | 'mobile';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  description?: string;
  badge?: string | number;
  isActive?: boolean;
  isDisabled?: boolean;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  children?: NavigationItem[];
  metadata?: {
    category?: string;
    order?: number;
    isNew?: boolean;
    isExternal?: boolean;
  };
  accessibility?: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
    keyboardShortcut?: string;
  };
}

export interface NavigationSection {
  id: string;
  label: string;
  items: NavigationItem[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  requiredRoles?: UserRole[];
  accessibility?: {
    ariaLabel?: string;
    landmarkRole?: 'navigation' | 'banner' | 'main' | 'complementary';
  };
}

export interface NavigationConfig {
  sections: NavigationSection[];
  variant: NavigationVariant;
  isAuthenticated: boolean;
  userRole?: UserRole;
  permissions?: string[];
  features?: {
    showBadges?: boolean;
    showIcons?: boolean;
    showTooltips?: boolean;
    enableKeyboardShortcuts?: boolean;
    enableSkipLinks?: boolean;
  };
}

export interface NavigationState {
  activeItemId?: string;
  expandedSections: string[];
  collapsedSections: string[];
  focusedItemId?: string;
  isNavigating: boolean;
}

export interface NavigationProps {
  config: NavigationConfig;
  state?: NavigationState;
  onItemClick?: (item: NavigationItem) => void;
  onStateChange?: (state: NavigationState) => void;
  className?: string;
  'aria-label'?: string;
}

// Accessibility-focused interfaces
export interface AccessibilityFeatures {
  skipLinks: SkipLink[];
  announcements: string[];
  focusTrap?: boolean;
  autoFocus?: boolean;
  keyboardNavigation: KeyboardNavigationConfig;
}

export interface SkipLink {
  id: string;
  label: string;
  targetId: string;
  keyboardShortcut?: string;
}

export interface KeyboardNavigationConfig {
  enabled: boolean;
  keys: {
    next: string[];
    previous: string[];
    open: string[];
    close: string[];
    home: string[];
    end: string[];
  };
}

// Role-based permission system
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'read' | 'write' | 'admin' | 'special';
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Navigation analytics and tracking
export interface NavigationAnalytics {
  trackItemClick?: (item: NavigationItem) => void;
  trackSectionExpand?: (section: NavigationSection) => void;
  trackKeyboardUsage?: (key: string, action: string) => void;
  trackAccessibilityFeature?: (feature: string) => void;
}

// Navigation customization
export interface NavigationCustomization {
  theme?: 'light' | 'dark' | 'auto';
  density?: 'compact' | 'comfortable' | 'spacious';
  animation?: 'none' | 'subtle' | 'enhanced';
  reducedMotion?: boolean;
}

// Error handling
export interface NavigationError {
  code: string;
  message: string;
  item?: NavigationItem;
  recoverable: boolean;
}

// Navigation context for React Context API
export interface NavigationContextValue {
  config: NavigationConfig;
  state: NavigationState;
  setState: (state: NavigationState) => void;
  accessibility: AccessibilityFeatures;
  analytics?: NavigationAnalytics;
  customization?: NavigationCustomization;
  error?: NavigationError;
}