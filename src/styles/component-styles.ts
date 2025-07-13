// Component-specific styling utilities using design tokens
import { designTokens, componentTokens } from './design-tokens';

// Status badge color mappings using design tokens
export const statusStyles = {
  // Report statuses
  report: {
    open: {
      background: 'hsl(var(--warning) / 0.1)',
      color: 'hsl(var(--warning-foreground))',
      border: 'hsl(var(--warning) / 0.2)',
    },
    in_progress: {
      background: 'hsl(var(--info) / 0.1)',
      color: 'hsl(var(--info-foreground))',
      border: 'hsl(var(--info) / 0.2)',
    },
    resolved: {
      background: 'hsl(var(--success) / 0.1)',
      color: 'hsl(var(--success-foreground))',
      border: 'hsl(var(--success) / 0.2)',
    },
    closed: {
      background: 'hsl(var(--muted))',
      color: 'hsl(var(--muted-foreground))',
      border: 'hsl(var(--border))',
    },
  },
  
  // Document statuses
  document: {
    rascunho: {
      background: 'hsl(var(--warning) / 0.1)',
      color: 'hsl(var(--warning-foreground))',
      border: 'hsl(var(--warning) / 0.2)',
    },
    publicado: {
      background: 'hsl(var(--success) / 0.1)',
      color: 'hsl(var(--success-foreground))',
      border: 'hsl(var(--success) / 0.2)',
    },
    arquivado: {
      background: 'hsl(var(--muted))',
      color: 'hsl(var(--muted-foreground))',
      border: 'hsl(var(--border))',
    },
  },
};

// Priority badge color mappings
export const priorityStyles = {
  urgent: {
    background: 'hsl(var(--destructive) / 0.1)',
    color: 'hsl(var(--destructive-foreground))',
    border: 'hsl(var(--destructive) / 0.2)',
  },
  high: {
    background: 'hsl(var(--warning) / 0.1)',
    color: 'hsl(var(--warning-foreground))',
    border: 'hsl(var(--warning) / 0.2)',
  },
  medium: {
    background: 'hsl(var(--info) / 0.1)',
    color: 'hsl(var(--info-foreground))',
    border: 'hsl(var(--info) / 0.2)',
  },
  low: {
    background: 'hsl(var(--muted))',
    color: 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--border))',
  },
};

// Document type badge color mappings
export const documentTypeStyles = {
  ata: {
    background: 'hsl(var(--primary) / 0.1)',
    color: 'hsl(var(--primary-foreground))',
    border: 'hsl(var(--primary) / 0.2)',
  },
  agenda: {
    background: 'hsl(var(--info) / 0.1)',
    color: 'hsl(var(--info-foreground))',
    border: 'hsl(var(--info) / 0.2)',
  },
  processo: {
    background: 'hsl(var(--warning) / 0.1)',
    color: 'hsl(var(--warning-foreground))',
    border: 'hsl(var(--warning) / 0.2)',
  },
  parecer: {
    background: 'hsl(var(--secondary) / 0.1)',
    color: 'hsl(var(--secondary-foreground))',
    border: 'hsl(var(--secondary) / 0.2)',
  },
  licenca: {
    background: 'hsl(var(--success) / 0.1)',
    color: 'hsl(var(--success-foreground))',
    border: 'hsl(var(--success) / 0.2)',
  },
  resolucao: {
    background: 'hsl(var(--destructive) / 0.1)',
    color: 'hsl(var(--destructive-foreground))',
    border: 'hsl(var(--destructive) / 0.2)',
  },
};

// Standardized spacing using design tokens
export const spacingClasses = {
  // Container spacing
  container: {
    padding: 'px-6 py-8',
    maxWidth: 'container mx-auto',
  },
  
  // Section spacing
  section: {
    marginBottom: 'mb-8',
    gap: 'gap-6',
  },
  
  // Card spacing
  card: {
    padding: componentTokens.card.padding,
    gap: 'gap-4',
    marginBottom: 'mb-6',
  },
  
  // Header spacing
  header: {
    marginBottom: 'mb-8',
    gap: 'gap-4',
  },
  
  // Content spacing
  content: {
    gap: 'gap-4',
    itemGap: 'gap-2',
    smallGap: 'gap-1',
  },
};

// Standardized typography using design tokens
export const typographyClasses = {
  // Page headings
  pageTitle: 'text-3xl font-bold text-foreground',
  pageSubtitle: 'text-muted-foreground',
  
  // Section headings
  sectionTitle: 'text-2xl font-semibold text-foreground',
  sectionSubtitle: 'text-lg text-muted-foreground',
  
  // Card headings
  cardTitle: 'text-xl font-semibold text-foreground',
  cardSubtitle: 'text-sm text-muted-foreground',
  
  // Body text
  body: 'text-base text-foreground',
  bodySecondary: 'text-sm text-muted-foreground',
  caption: 'text-xs text-muted-foreground',
  
  // Interactive text
  link: 'text-primary hover:text-primary-hover transition-colors',
  button: 'font-medium',
};

// Standardized elevation/shadow system
export const elevationClasses = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  base: 'shadow-md',
  md: 'shadow-lg',
  lg: 'shadow-xl',
  xl: 'shadow-2xl',
  
  // Interactive shadows
  hover: 'hover:shadow-lg transition-shadow duration-200',
  focus: 'focus:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2',
};

// Standardized card variants
export const cardVariants = {
  // Default card
  default: `rounded-lg border bg-card text-card-foreground ${elevationClasses.base}`,
  
  // Stat cards (Dashboard)
  stat: `rounded-lg border bg-card text-card-foreground ${elevationClasses.base} ${elevationClasses.hover}`,
  
  // List item cards
  listItem: `rounded-lg border bg-card text-card-foreground ${elevationClasses.sm} ${elevationClasses.hover}`,
  
  // Filter cards
  filter: `rounded-lg border bg-card text-card-foreground ${elevationClasses.sm}`,
  
  // Document cards
  document: `rounded-lg border bg-card text-card-foreground ${elevationClasses.base} ${elevationClasses.hover}`,
};

// Standardized button variants using design tokens
export const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

// Standardized form spacing
export const formClasses = {
  field: 'space-y-2',
  fieldGroup: 'space-y-4',
  row: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  actions: 'flex gap-2 justify-end',
};

// Standardized loading states
export const loadingClasses = {
  container: 'min-h-screen flex items-center justify-center',
  content: 'flex items-center gap-3',
  spinner: 'w-6 h-6 animate-spin text-primary',
  text: 'text-lg text-foreground',
};

// Standardized empty states
export const emptyStateClasses = {
  container: 'flex flex-col items-center justify-center py-12',
  icon: 'w-16 h-16 text-muted-foreground mb-4',
  title: 'text-lg font-semibold mb-2',
  description: 'text-muted-foreground text-center mb-4',
};

// Utility functions for generating consistent class names
export const generateStatusClass = (type: 'report' | 'document', status: string) => {
  const styles = statusStyles[type]?.[status as keyof typeof statusStyles[typeof type]] || statusStyles.report.closed;
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`;
};

export const generatePriorityClass = (priority: string) => {
  const styles = priorityStyles[priority as keyof typeof priorityStyles] || priorityStyles.low;
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`;
};

export const generateDocumentTypeClass = (type: string) => {
  const styles = documentTypeStyles[type as keyof typeof documentTypeStyles] || documentTypeStyles.ata;
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`;
};

// Icon sizing standards
export const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-12 h-12',
  '3xl': 'w-16 h-16',
};

// Consistent animation classes
export const animationClasses = {
  fadeIn: 'animate-in fade-in-0 duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  
  // Hover animations
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  hoverLift: 'hover:-translate-y-1 transition-transform duration-200',
  
  // Focus animations
  focusRing: 'focus:ring-2 focus:ring-primary focus:ring-offset-2',
};

export default {
  statusStyles,
  priorityStyles,
  documentTypeStyles,
  spacingClasses,
  typographyClasses,
  elevationClasses,
  cardVariants,
  buttonVariants,
  formClasses,
  loadingClasses,
  emptyStateClasses,
  generateStatusClass,
  generatePriorityClass,
  generateDocumentTypeClass,
  iconSizes,
  animationClasses,
};