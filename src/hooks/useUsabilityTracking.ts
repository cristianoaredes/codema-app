import * as React from "react"
import { UsabilityMetrics } from "@/types/feedback"

export const useUsabilityTracking = () => {
  const [metrics, setMetrics] = React.useState<UsabilityMetrics>({
    pageViews: 0,
    timeOnPage: 0,
    clickEvents: 0,
    scrollDepth: 0,
    errors: 0,
    completedTasks: 0
  })

  const trackPageView = React.useCallback(() => {
    setMetrics(prev => ({ ...prev, pageViews: prev.pageViews + 1 }))
  }, [])

  const trackClick = React.useCallback(() => {
    setMetrics(prev => ({ ...prev, clickEvents: prev.clickEvents + 1 }))
  }, [])

  const trackError = React.useCallback(() => {
    setMetrics(prev => ({ ...prev, errors: prev.errors + 1 }))
  }, [])

  const trackTaskCompletion = React.useCallback(() => {
    setMetrics(prev => ({ ...prev, completedTasks: prev.completedTasks + 1 }))
  }, [])

  React.useEffect(() => {
    const startTime = Date.now()
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      
      setMetrics(prev => ({ 
        ...prev, 
        scrollDepth: Math.max(prev.scrollDepth, scrollPercent) 
      }))
    }

    const handleClick = () => trackClick()

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('click', handleClick)

    return () => {
      const timeOnPage = Date.now() - startTime
      setMetrics(prev => ({ ...prev, timeOnPage }))
      
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClick)
    }
  }, [trackClick])

  return {
    metrics,
    trackPageView,
    trackClick,
    trackError,
    trackTaskCompletion
  }
}
