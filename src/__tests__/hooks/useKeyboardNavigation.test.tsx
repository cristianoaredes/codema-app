import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils/render'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import type { MenuItem } from '@/types/navigation'

function Demo() {
  const items = React.useMemo<MenuItem[]>(
    () => [
      { id: '1', label: 'Item 1', href: '/' },
      { id: '2', label: 'Item 2', href: '/2' },
      { id: '3', label: 'Item 3', href: '/3' },
    ],
    []
  )
  const { focusedIndex } = useKeyboardNavigation(items)
  return <div data-testid="focused-index">{focusedIndex}</div>
}

describe('useKeyboardNavigation', () => {
  it('cicla índices com ArrowDown/ArrowUp e reseta com Escape', () => {
    render(<Demo />)

    const idx = () => Number(screen.getByTestId('focused-index').textContent)
    expect(idx()).toBe(-1)

    fireEvent.keyDown(document, { key: 'ArrowDown' })
    expect(idx()).toBe(0)

    fireEvent.keyDown(document, { key: 'ArrowDown' })
    expect(idx()).toBe(1)

    fireEvent.keyDown(document, { key: 'ArrowUp' })
    expect(idx()).toBe(0)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(idx()).toBe(-1)
  })
})
