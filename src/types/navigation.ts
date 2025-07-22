// Navigation system types
export interface MenuItem {
  id: string
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  children?: MenuItem[]
  badge?: string | number
  disabled?: boolean
}

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  current?: boolean
}
