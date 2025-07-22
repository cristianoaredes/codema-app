import { useState, useEffect } from 'react'

/**
 * Hook personalizado para detectar media queries
 * @param query - String da media query (ex: "(max-width: 768px)")
 * @returns boolean - true se a media query corresponder
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Verifica se estamos no ambiente do navegador
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)
    
    // Define o estado inicial
    setMatches(mediaQuery.matches)

    // Função para atualizar o estado quando a media query mudar
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Adiciona o listener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup: remove o listener quando o componente desmontar
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

// Hooks específicos para breakpoints comuns
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')
export const useIsLarge = () => useMediaQuery('(min-width: 1280px)')

// Hook para detectar preferência de tema do sistema
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)')

// Hook para detectar se o usuário prefere movimento reduzido
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

// Hook para detectar orientação
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)')
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)')

// Hook para detectar se é um dispositivo touch
export const useIsTouchDevice = () => useMediaQuery('(pointer: coarse)')
