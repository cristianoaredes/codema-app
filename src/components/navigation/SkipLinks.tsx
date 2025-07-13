import React from 'react';
import { SkipLink } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface SkipLinksProps {
  links: SkipLink[];
  className?: string;
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  const handleSkipClick = (targetId: string) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, link: SkipLink) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSkipClick(link.targetId);
    }
  };

  if (links.length === 0) return null;

  return (
    <div className={cn("skip-links", className)}>
      <ul
        className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-50 flex gap-2 p-2 bg-background border-b shadow-lg"
        role="list"
        aria-label="Links de navegação rápida"
      >
        {links.map((link) => (
          <li key={link.id} role="listitem">
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md",
                "hover:bg-primary/90 focus:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "transition-colors duration-200"
              )}
              onClick={() => handleSkipClick(link.targetId)}
              onKeyDown={(e) => handleKeyDown(e, link)}
              aria-label={`${link.label}${link.keyboardShortcut ? ` (${link.keyboardShortcut})` : ''}`}
            >
              {link.label}
              {link.keyboardShortcut && (
                <span className="ml-2 text-xs opacity-75">
                  {link.keyboardShortcut}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}