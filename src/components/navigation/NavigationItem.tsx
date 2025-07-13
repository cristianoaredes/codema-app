import React, { forwardRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { NavigationItem as NavigationItemType } from '@/types/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavigationItemProps {
  item: NavigationItemType;
  isActive?: boolean;
  isFocused?: boolean;
  isExpanded?: boolean;
  level?: number;
  variant?: 'horizontal' | 'sidebar' | 'mobile';
  showIcons?: boolean;
  showBadges?: boolean;
  showTooltips?: boolean;
  onSelect?: (item: NavigationItemType) => void;
  onToggle?: (itemId: string) => void;
  onFocus?: (itemId: string) => void;
  onBlur?: () => void;
  className?: string;
}

export const NavigationItem = forwardRef<HTMLElement, NavigationItemProps>(
  ({
    item,
    isActive = false,
    isFocused = false,
    isExpanded = false,
    level = 0,
    variant = 'sidebar',
    showIcons = true,
    showBadges = true,
    showTooltips = true,
    onSelect,
    onToggle,
    onFocus,
    onBlur,
    className
  }, ref) => {
    const hasChildren = item.children && item.children.length > 0;
    const isDisabled = item.isDisabled;
    const isExternal = item.metadata?.isExternal;

    // Handle item click
    const handleClick = useCallback((e: React.MouseEvent) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }

      if (hasChildren) {
        e.preventDefault();
        onToggle?.(item.id);
      } else {
        onSelect?.(item);
      }
    }, [isDisabled, hasChildren, onToggle, onSelect, item]);

    // Handle keyboard interactions
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (hasChildren) {
            onToggle?.(item.id);
          } else {
            onSelect?.(item);
          }
          break;
        case 'ArrowRight':
          if (hasChildren && !isExpanded) {
            e.preventDefault();
            onToggle?.(item.id);
          }
          break;
        case 'ArrowLeft':
          if (hasChildren && isExpanded) {
            e.preventDefault();
            onToggle?.(item.id);
          }
          break;
      }
    }, [hasChildren, isExpanded, onToggle, onSelect, item]);

    // Handle focus events
    const handleFocus = useCallback(() => {
      onFocus?.(item.id);
    }, [onFocus, item.id]);

    // Base classes for styling
    const baseClasses = cn(
      'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'focus:bg-accent focus:text-accent-foreground focus:outline-none',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      {
        'bg-accent text-accent-foreground': isActive,
        'bg-accent/50 text-accent-foreground': isFocused,
        'opacity-50 cursor-not-allowed': isDisabled,
        'cursor-pointer': !isDisabled,
        'pl-6': level === 1,
        'pl-9': level === 2,
        'pl-12': level >= 3,
      },
      className
    );

    // Icon component
    const IconComponent = item.icon ? (
      <span className="h-4 w-4 flex-shrink-0" aria-hidden="true">
        {/* Icon would be rendered here based on item.icon */}
        <div className="h-4 w-4 bg-current rounded-sm opacity-60" />
      </span>
    ) : null;

    // Expansion indicator for items with children
    const ExpansionIndicator = hasChildren ? (
      <span className="ml-auto h-4 w-4 flex-shrink-0 text-muted-foreground">
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </span>
    ) : null;

    // Badge component
    const BadgeComponent = showBadges && item.badge ? (
      <Badge variant="secondary" className="ml-auto text-xs">
        {item.badge}
      </Badge>
    ) : null;

    // Main content
    const content = (
      <>
        {showIcons && IconComponent}
        <span className="flex-1 truncate">{item.label}</span>
        {BadgeComponent}
        {ExpansionIndicator}
      </>
    );

    // Accessibility attributes
    const ariaAttributes = {
      'aria-label': item.accessibility?.ariaLabel || item.label,
      'aria-describedby': item.accessibility?.ariaDescribedBy,
      'aria-current': isActive ? ('page' as const) : undefined,
      'aria-expanded': hasChildren ? isExpanded : undefined,
      'aria-disabled': isDisabled,
      'role': hasChildren ? 'button' : 'menuitem',
      'tabIndex': isFocused ? 0 : -1,
    };

    // Render as link or button based on whether it has children
    const ItemComponent = hasChildren ? (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        className={baseClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={onBlur}
        disabled={isDisabled}
        {...ariaAttributes}
      >
        {content}
      </button>
    ) : (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        to={item.href}
        className={baseClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={onBlur}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...ariaAttributes}
      >
        {content}
        {isExternal && (
          <span className="sr-only"> (opens in new tab)</span>
        )}
      </Link>
    );

    // Wrap with tooltip if enabled and description exists
    if (showTooltips && item.description && !isDisabled) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {ItemComponent}
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p>{item.description}</p>
            {item.accessibility?.keyboardShortcut && (
              <p className="mt-1 text-xs text-muted-foreground">
                Atalho: {item.accessibility.keyboardShortcut}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return ItemComponent;
  }
);

NavigationItem.displayName = 'NavigationItem';