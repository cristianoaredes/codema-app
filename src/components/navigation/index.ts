// Navigation Component Library Export
// This file provides a clean interface for importing navigation components

export { UnifiedNavigation } from './UnifiedNavigation';
export { NavigationItem } from './NavigationItem';
export { SkipLinks } from './SkipLinks';
export { NavigationProvider, useNavigationContext, useNavigationState, useNavigationConfig, useNavigationAccessibility, useNavigationAnalytics, useNavigationCustomization } from './NavigationProvider';

// Re-export navigation types and utilities
export type { NavigationProps, NavigationConfig, NavigationState, NavigationItem as NavigationItemType, NavigationSection, UserRole } from '@/types/navigation';
export { createNavigationConfig, publicNavigationConfig, authenticatedNavigationConfig, accessibilityFeatures, navigationAnalytics } from '@/config/navigation';

// Re-export hooks
export { useNavigation } from '@/hooks/useNavigation';
export { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
export { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

// Re-export permission utilities
export { 
  PERMISSIONS, 
  PermissionChecker, 
  createPermissionChecker, 
  getUserPermissions, 
  hasPermission, 
  hasAnyPermission, 
  hasRole, 
  hasAnyRole,
  getRoleLevel,
  hasHigherRole,
  hasEqualOrHigherRole,
  getRoleLabel,
  getAllRoles,
  getAvailableRoles,
  ROLE_LABELS,
  ROLE_HIERARCHY
} from '@/utils/permissions';