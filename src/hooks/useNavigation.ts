import { useState, useCallback, useEffect } from 'react';
import { NavigationConfig, NavigationState, NavigationItem } from '@/types/navigation';

export function useNavigation(config: NavigationConfig) {
  const [state, setState] = useState<NavigationState>({
    activeItemId: undefined,
    expandedSections: [],
    collapsedSections: [],
    focusedItemId: undefined,
    isNavigating: false
  });

  // Set active item based on current pathname
  const setActiveItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      activeItemId: itemId
    }));
  }, []);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setState(prev => {
      const isExpanded = prev.expandedSections.includes(sectionId);
      
      if (isExpanded) {
        return {
          ...prev,
          expandedSections: prev.expandedSections.filter(id => id !== sectionId),
          collapsedSections: [...prev.collapsedSections, sectionId]
        };
      } else {
        return {
          ...prev,
          expandedSections: [...prev.expandedSections, sectionId],
          collapsedSections: prev.collapsedSections.filter(id => id !== sectionId)
        };
      }
    });
  }, []);

  // Set focused item for keyboard navigation
  const setFocusedItem = useCallback((itemId: string | undefined) => {
    setState(prev => ({
      ...prev,
      focusedItemId: itemId
    }));
  }, []);

  // Mark navigation as in progress
  const setNavigating = useCallback((isNavigating: boolean) => {
    setState(prev => ({
      ...prev,
      isNavigating
    }));
  }, []);

  // Get all navigation items flattened
  const getAllItems = useCallback((): NavigationItem[] => {
    const items: NavigationItem[] = [];
    
    config.sections.forEach(section => {
      section.items.forEach(item => {
        items.push(item);
        if (item.children) {
          items.push(...item.children);
        }
      });
    });
    
    return items;
  }, [config]);

  // Find navigation item by ID
  const findItem = useCallback((itemId: string): NavigationItem | undefined => {
    return getAllItems().find(item => item.id === itemId);
  }, [getAllItems]);

  // Get navigation breadcrumbs
  const getBreadcrumbs = useCallback((itemId: string): NavigationItem[] => {
    const breadcrumbs: NavigationItem[] = [];
    const item = findItem(itemId);
    
    if (item) {
      breadcrumbs.push(item);
      
      // Find parent items
      config.sections.forEach(section => {
        section.items.forEach(parentItem => {
          if (parentItem.children?.some(child => child.id === itemId)) {
            breadcrumbs.unshift(parentItem);
          }
        });
      });
    }
    
    return breadcrumbs;
  }, [config, findItem]);

  // Check if user has permission to access item
  const hasPermission = useCallback((item: NavigationItem): boolean => {
    if (!item.requiredRoles && !item.requiredPermissions) {
      return true;
    }
    
    if (item.requiredRoles && config.userRole) {
      return item.requiredRoles.includes(config.userRole);
    }
    
    if (item.requiredPermissions && config.permissions) {
      return item.requiredPermissions.some(permission => 
        config.permissions!.includes(permission) || config.permissions!.includes('*')
      );
    }
    
    return false;
  }, [config]);

  // Get filtered navigation items based on permissions
  const getFilteredItems = useCallback(() => {
    return config.sections.map(section => ({
      ...section,
      items: section.items.filter(hasPermission).map(item => ({
        ...item,
        children: item.children?.filter(hasPermission)
      }))
    })).filter(section => section.items.length > 0);
  }, [config, hasPermission]);

  // Auto-detect active item based on current URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const matchingItem = getAllItems().find(item => 
      item.href === currentPath || 
      (item.href !== '/' && currentPath.startsWith(item.href))
    );
    
    if (matchingItem) {
      setActiveItem(matchingItem.id);
    }
  }, [getAllItems, setActiveItem]);

  return {
    state,
    setState,
    setActiveItem,
    toggleSection,
    setFocusedItem,
    setNavigating,
    getAllItems,
    findItem,
    getBreadcrumbs,
    hasPermission,
    getFilteredItems,
    config
  };
}