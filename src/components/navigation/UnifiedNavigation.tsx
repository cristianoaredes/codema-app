import React, { useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationProps, NavigationItem as NavigationItemType, NavigationSection } from '@/types/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { NavigationItem } from './NavigationItem';
import { SkipLinks } from './SkipLinks';
import { cn } from '@/lib/utils';
import { accessibilityFeatures } from '@/config/navigation';

export function UnifiedNavigation({
  config,
  state,
  onItemClick,
  onStateChange,
  className,
  'aria-label': ariaLabel = 'Navegação principal'
}: NavigationProps) {
  const location = useLocation();
  const containerRef = useRef<HTMLElement>(null);
  
  // Use our navigation hook
  const navigation = useNavigation(config);
  const currentState = state || navigation.state;
  
  // Get filtered sections based on user permissions
  const filteredSections = navigation.getFilteredItems();
  
  // Flatten all items for keyboard navigation
  const allItems = navigation.getAllItems();
  
  // Handle item selection
  const handleItemSelect = useCallback((item: NavigationItemType) => {
    navigation.setNavigating(true);
    onItemClick?.(item);
    
    // Update state
    const newState = {
      ...currentState,
      activeItemId: item.id,
      isNavigating: false
    };
    
    navigation.setState(newState);
    onStateChange?.(newState);
  }, [navigation, currentState, onItemClick, onStateChange]);
  
  // Handle section toggle
  const handleSectionToggle = useCallback((sectionId: string) => {
    navigation.toggleSection(sectionId);
    onStateChange?.(navigation.state);
  }, [navigation, onStateChange]);
  
  // Handle focus change
  const handleFocusChange = useCallback((itemId: string | undefined) => {
    navigation.setFocusedItem(itemId);
    onStateChange?.(navigation.state);
  }, [navigation, onStateChange]);
  
  // Setup keyboard navigation
  const keyboardNav = useKeyboardNavigation({
    items: allItems,
    onItemSelect: handleItemSelect,
    onSectionToggle: handleSectionToggle,
    focusedItemId: currentState.focusedItemId,
    onFocusChange: handleFocusChange,
    isEnabled: config.features?.enableKeyboardShortcuts !== false,
    containerRef
  });
  
  // Determine if item is active based on current location
  const isItemActive = useCallback((item: NavigationItemType) => {
    if (currentState.activeItemId === item.id) return true;
    if (item.href === location.pathname) return true;
    if (item.href !== '/' && location.pathname.startsWith(item.href)) return true;
    return false;
  }, [currentState.activeItemId, location.pathname]);
  
  // Determine if item is focused
  const isItemFocused = useCallback((item: NavigationItemType) => {
    return currentState.focusedItemId === item.id;
  }, [currentState.focusedItemId]);
  
  // Determine if section is expanded
  const isSectionExpanded = useCallback((sectionId: string) => {
    return currentState.expandedSections.includes(sectionId);
  }, [currentState.expandedSections]);
  
  // Render navigation section
  const renderSection = (section: NavigationSection, sectionIndex: number) => {
    const isExpanded = isSectionExpanded(section.id);
    const hasVisibleItems = section.items.length > 0;
    
    if (!hasVisibleItems) return null;
    
    return (
      <div
        key={section.id}
        className="navigation-section"
        role={section.accessibility?.landmarkRole || 'group'}
        aria-labelledby={`section-${section.id}-label`}
      >
        {/* Section Header */}
        {section.label && (
          <div
            id={`section-${section.id}-label`}
            className={cn(
              "px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
              {
                "mt-6": sectionIndex > 0
              }
            )}
          >
            {section.label}
          </div>
        )}
        
        {/* Section Items */}
        <div className="space-y-1">
          {section.items.map((item) => renderItem(item, 0))}
        </div>
      </div>
    );
  };
  
  // Render navigation item and its children
  const renderItem = (item: NavigationItemType, level: number = 0) => {
    const isActive = isItemActive(item);
    const isFocused = isItemFocused(item);
    const isExpanded = item.children ? isSectionExpanded(item.id) : false;
    
    return (
      <div key={item.id}>
        <NavigationItem
          item={item}
          isActive={isActive}
          isFocused={isFocused}
          isExpanded={isExpanded}
          level={level}
          variant={config.variant}
          showIcons={config.features?.showIcons}
          showBadges={config.features?.showBadges}
          showTooltips={config.features?.showTooltips}
          onSelect={handleItemSelect}
          onToggle={handleSectionToggle}
          onFocus={handleFocusChange}
        />
        
        {/* Render children if expanded */}
        {item.children && isExpanded && (
          <div className="mt-1 space-y-1" role="group" aria-label={`${item.label} submenu`}>
            {item.children.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // Base navigation classes based on variant
  const navigationClasses = cn(
    'navigation-container',
    {
      // Sidebar variant (default)
      'flex flex-col space-y-2': config.variant === 'sidebar',
      // Horizontal variant
      'flex flex-row space-x-2': config.variant === 'horizontal',
      // Mobile variant
      'flex flex-col space-y-1': config.variant === 'mobile',
    },
    className
  );
  
  return (
    <>
      {/* Skip Links */}
      {config.features?.enableSkipLinks && (
        <SkipLinks links={accessibilityFeatures.skipLinks} />
      )}
      
      {/* Screen Reader Announcer */}
      <keyboardNav.ScreenReaderAnnouncer />
      
      {/* Main Navigation */}
      <nav
        ref={containerRef}
        className={navigationClasses}
        aria-label={ariaLabel}
        role="navigation"
      >
        {/* Navigation Sections */}
        {filteredSections.map((section, index) => renderSection(section, index))}
        
        {/* Loading State */}
        {currentState.isNavigating && (
          <div
            className="px-3 py-2 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            Navegando...
          </div>
        )}
      </nav>
    </>
  );
}

export default UnifiedNavigation;