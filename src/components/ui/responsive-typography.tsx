import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveHeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function ResponsiveHeading({ 
  children, 
  level = 1, 
  className,
  as 
}: ResponsiveHeadingProps) {
  const Component = as || (`h${level}` as keyof JSX.IntrinsicElements);
  
  const levelStyles = {
    1: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
    2: "text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight",
    3: "text-lg sm:text-xl lg:text-2xl font-semibold",
    4: "text-base sm:text-lg lg:text-xl font-semibold",
    5: "text-sm sm:text-base lg:text-lg font-medium",
    6: "text-xs sm:text-sm lg:text-base font-medium"
  };

  return (
    <Component className={cn(levelStyles[level], className)}>
      {children}
    </Component>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  variant?: 'default' | 'muted' | 'accent';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function ResponsiveText({ 
  children, 
  size = 'base',
  variant = 'default',
  className,
  as = 'p'
}: ResponsiveTextProps) {
  const Component = as;
  
  const sizeStyles = {
    xs: "text-xs sm:text-xs",
    sm: "text-sm sm:text-sm",
    base: "text-sm sm:text-base",
    lg: "text-base sm:text-lg",
    xl: "text-lg sm:text-xl"
  };

  const variantStyles = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    accent: "text-accent-foreground"
  };

  return (
    <Component className={cn(
      sizeStyles[size],
      variantStyles[variant],
      className
    )}>
      {children}
    </Component>
  );
}

// Responsive spacing component
interface ResponsiveSpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function ResponsiveSpacer({ size = 'md', className }: ResponsiveSpacerProps) {
  const sizeStyles = {
    xs: "h-2 sm:h-2",
    sm: "h-3 sm:h-4",
    md: "h-4 sm:h-6",
    lg: "h-6 sm:h-8",
    xl: "h-8 sm:h-10",
    '2xl': "h-10 sm:h-12"
  };

  return <div className={cn(sizeStyles[size], className)} />;
}

// Responsive container with proper max-widths and padding
interface ResponsiveContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function ResponsiveContainer({ 
  children, 
  size = 'lg',
  className 
}: ResponsiveContainerProps) {
  const sizeStyles = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md", 
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    full: "max-w-full"
  };

  return (
    <div className={cn(
      "mx-auto px-3 sm:px-4 md:px-6 lg:px-8",
      sizeStyles[size],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive grid system
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md',
  className 
}: ResponsiveGridProps) {
  const gapStyles = {
    xs: "gap-2",
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
    xl: "gap-8 sm:gap-10"
  };

  // Build responsive grid classes
  const gridClasses = [];
  if (cols.default) gridClasses.push(`grid-cols-${cols.default}`);
  if (cols.sm) gridClasses.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) gridClasses.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) gridClasses.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) gridClasses.push(`xl:grid-cols-${cols.xl}`);

  return (
    <div className={cn(
      "grid",
      gapStyles[gap],
      gridClasses.join(" "),
      className
    )}>
      {children}
    </div>
  );
}

// Responsive card with mobile-optimized padding
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveCard({ 
  children, 
  className,
  padding = 'md'
}: ResponsiveCardProps) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  };

  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      paddingStyles[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive stack layout
interface ResponsiveStackProps {
  children: React.ReactNode;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ResponsiveStack({ 
  children, 
  space = 'md',
  className 
}: ResponsiveStackProps) {
  const spaceStyles = {
    xs: "space-y-2",
    sm: "space-y-3 sm:space-y-4",
    md: "space-y-4 sm:space-y-6",
    lg: "space-y-6 sm:space-y-8",
    xl: "space-y-8 sm:space-y-10"
  };

  return (
    <div className={cn(spaceStyles[space], className)}>
      {children}
    </div>
  );
}