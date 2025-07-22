import * as React from "react"
import { MenuItem } from "@/types/navigation"

// Hook para navegação por teclado
export const useKeyboardNavigation = (items: MenuItem[]) => {
  const [focusedIndex, setFocusedIndex] = React.useState(-1)

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        )
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0 && items[focusedIndex]) {
          // Trigger item action
        }
        break
      case 'Escape':
        setFocusedIndex(-1)
        break
    }
  }, [items, focusedIndex])

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { focusedIndex, setFocusedIndex }
}
