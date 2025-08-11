import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { AuthProvider } from '@/components/auth/AuthProvider'

function Consumer() {
  const auth = useAuth()
  return <div>loading:{String(auth.loading)}</div>
}

describe('useAuth', () => {
  it('fornece contexto válido quando usado dentro do AuthProvider', () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    )
    expect(screen.getByText(/loading:/i)).toBeInTheDocument()
  })
})
