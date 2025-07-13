import { useMemo } from 'react';
import { NavigationConfig, NavigationItem, NavigationSection, UserRole } from '@/types/navigation';
import { PermissionChecker, createPermissionChecker } from '@/utils/permissions';
import { useAuth } from '@/hooks/useAuth';

interface UseRoleBasedNavigationProps {
  baseConfig: NavigationConfig;
}

export function useRoleBasedNavigation({ baseConfig }: UseRoleBasedNavigationProps) {
  const { user, profile } = useAuth();
  
  // Get user role from profile
  const userRole: UserRole = (profile?.role as UserRole) || 'user';
  const isAuthenticated = !!user;
  
  // Create permission checker for current user
  const permissionChecker = useMemo(() => {
    return createPermissionChecker(userRole);
  }, [userRole]);
  
  // Filter navigation items based on role and permissions
  const filterNavigationItem = (item: NavigationItem): NavigationItem | null => {
    // Check role requirements
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      if (!permissionChecker.hasAnyRole(item.requiredRoles)) {
        return null;
      }
    }
    
    // Check permission requirements
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      if (!permissionChecker.hasAnyPermission(item.requiredPermissions)) {
        return null;
      }
    }
    
    // Filter children recursively
    const filteredChildren = item.children
      ?.map(child => filterNavigationItem(child))
      .filter((child): child is NavigationItem => child !== null);
    
    return {
      ...item,
      children: filteredChildren
    };
  };
  
  // Filter navigation sections based on role and permissions
  const filterNavigationSection = (section: NavigationSection): NavigationSection | null => {
    // Check section role requirements
    if (section.requiredRoles && section.requiredRoles.length > 0) {
      if (!permissionChecker.hasAnyRole(section.requiredRoles)) {
        return null;
      }
    }
    
    // Filter section items
    const filteredItems = section.items
      .map(item => filterNavigationItem(item))
      .filter((item): item is NavigationItem => item !== null);
    
    // Return null if no items remain after filtering
    if (filteredItems.length === 0) {
      return null;
    }
    
    return {
      ...section,
      items: filteredItems
    };
  };
  
  // Create filtered navigation config
  const filteredConfig = useMemo((): NavigationConfig => {
    const filteredSections = baseConfig.sections
      .map(section => filterNavigationSection(section))
      .filter((section): section is NavigationSection => section !== null);
    
    return {
      ...baseConfig,
      sections: filteredSections,
      isAuthenticated,
      userRole,
      permissions: permissionChecker.getAllPermissions().map(p => p.id)
    };
  }, [baseConfig, isAuthenticated, userRole, permissionChecker]);
  
  // Additional utilities
  const canAccessItem = (itemId: string): boolean => {
    const findItem = (items: NavigationItem[]): NavigationItem | undefined => {
      for (const item of items) {
        if (item.id === itemId) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    for (const section of baseConfig.sections) {
      const item = findItem(section.items);
      if (item) {
        return filterNavigationItem(item) !== null;
      }
    }
    
    return false;
  };
  
  const canAccessSection = (sectionId: string): boolean => {
    const section = baseConfig.sections.find(s => s.id === sectionId);
    if (!section) return false;
    
    return filterNavigationSection(section) !== null;
  };
  
  const getUserPermissions = (): string[] => {
    return permissionChecker.getAllPermissions().map(p => p.id);
  };
  
  const hasPermission = (permission: string): boolean => {
    return permissionChecker.hasPermission(permission);
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissionChecker.hasAnyPermission(permissions);
  };
  
  const hasRole = (role: UserRole): boolean => {
    return permissionChecker.hasRole(role);
  };
  
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return permissionChecker.hasAnyRole(roles);
  };
  
  // Get navigation breadcrumbs with permission checking
  const getBreadcrumbs = (currentPath: string): NavigationItem[] => {
    const breadcrumbs: NavigationItem[] = [];
    
    const findPathItem = (items: NavigationItem[], path: string): NavigationItem | null => {
      for (const item of items) {
        if (item.href === path) {
          const filteredItem = filterNavigationItem(item);
          return filteredItem;
        }
        if (item.children) {
          const found = findPathItem(item.children, path);
          if (found) {
            const filteredItem = filterNavigationItem(item);
            if (filteredItem) {
              breadcrumbs.unshift(filteredItem);
            }
            return found;
          }
        }
      }
      return null;
    };
    
    for (const section of filteredConfig.sections) {
      const item = findPathItem(section.items, currentPath);
      if (item) {
        breadcrumbs.push(item);
        break;
      }
    }
    
    return breadcrumbs;
  };
  
  // Get user-specific navigation analytics
  const getNavigationAnalytics = () => {
    const totalItems = baseConfig.sections.reduce((acc, section) => {
      return acc + section.items.length + (section.items.reduce((childAcc, item) => {
        return childAcc + (item.children?.length || 0);
      }, 0));
    }, 0);
    
    const accessibleItems = filteredConfig.sections.reduce((acc, section) => {
      return acc + section.items.length + (section.items.reduce((childAcc, item) => {
        return childAcc + (item.children?.length || 0);
      }, 0));
    }, 0);
    
    return {
      totalItems,
      accessibleItems,
      accessibilityRatio: totalItems > 0 ? accessibleItems / totalItems : 0,
      userRole,
      permissionCount: permissionChecker.getAllPermissions().length
    };
  };
  
  return {
    // Core data
    config: filteredConfig,
    userRole,
    isAuthenticated,
    permissionChecker,
    
    // Utilities
    canAccessItem,
    canAccessSection,
    getUserPermissions,
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    getBreadcrumbs,
    getNavigationAnalytics,
    
    // Filters
    filterNavigationItem,
    filterNavigationSection
  };
}