import React from 'react'
import { describe, it } from 'vitest'
import { render } from '@/test-utils/render'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import type { MenuItem } from '@/types/navigation'

// Placeholder — teste marcado como skip até implementar com eventos reais de teclado
function Demo() {
  const items = React.useMemo<MenuItem[]>(() => [
    { id: '1', label: 'Item 1', href: '/' },
    { id: '2', label: 'Item 2', href: '/2' },
    { id: '3', label: 'Item 3', href: '/3' },
  ], [])
  const { focusedIndex } = useKeyboardNavigation(items)
  return <div data-testid="focused-index">{focusedIndex}</div>
}

describe('useKeyboardNavigation', () => {
  it.skip('cicla índices com ArrowDown/ArrowUp e reseta com Escape', async () => {
    render(<Demo />)
    // TODO: disparar KeyboardEvent('keydown', { key: 'ArrowDown' }) e validar mudanças
    // document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    // expect(screen.getByTestId('focused-index').textContent).toBe('0')
  })
})
