// Feedback system types
export interface FeedbackData {
  type: 'bug' | 'suggestion' | 'compliment' | 'other' | 'positive' | 'negative'
  priority?: 'low' | 'medium' | 'high'
  title?: string
  description?: string
  rating?: number
  email?: string
  allowContact?: boolean
  page?: string
  userAgent?: string
  timestamp?: string
  comment?: string
}

export interface UsabilityMetrics {
  pageViews: number
  timeOnPage: number
  clickEvents: number
  scrollDepth: number
  errors: number
  completedTasks: number
}
