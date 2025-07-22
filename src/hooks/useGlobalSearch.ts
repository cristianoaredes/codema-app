import React from "react"

// Hook para controlar a busca global
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = React.useState(false)

  // Atalho de teclado Ctrl+K ou Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    setIsOpen,
    openSearch: () => setIsOpen(true),
    closeSearch: () => setIsOpen(false)
  }
}
