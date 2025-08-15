import React from 'react'
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from '@/components/auth/ProtectedRoute'

vi.mock('@/hooks', () => ({ useAuth: vi.fn() }))
import { useAuth } from '@/hooks'
const mockedUseAuth = useAuth as unknown as Mock

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockedUseAuth.mockReset()
  })

  it('redireciona para /auth quando requireAuth e usuário não autenticado', async () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: false })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/privado' }]}> 
        <Routes>
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <div>Privado</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Página de Login')).toBeInTheDocument()
  })

  it('renderiza filhos quando usuário tem acesso CODEMA', () => {
    mockedUseAuth.mockReturnValue({ 
      user: { id: 'u1' }, 
      profile: { role: 'conselheiro_titular' }, 
      loading: false, 
      hasCODEMAAccess: true, 
      hasAdminAccess: false 
    })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/reunioes' }]}> 
        <Routes>
          <Route
            path="/reunioes"
            element={
              <ProtectedRoute requireCODEMAAccess>
                <div>Lista de Reuniões</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Lista de Reuniões')).toBeInTheDocument()
  })

  it('mostra Acesso Negado quando papel requerido não corresponde', () => {
    mockedUseAuth.mockReturnValue({ 
      user: { id: 'u1' }, 
      profile: { role: 'citizen' }, 
      loading: false, 
      hasCODEMAAccess: true, 
      hasAdminAccess: false 
    })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin' }]}> 
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <div>Admin Area</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Acesso Negado')).toBeInTheDocument()
  })
})

describe('PublicRoute', () => {
  beforeEach(() => {
    mockedUseAuth.mockReset()
  })

  it('redireciona usuário autenticado para /dashboard', () => {
    mockedUseAuth.mockReturnValue({ user: { id: 'u1' }, loading: false })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/auth' }]}> 
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <div>Página Pública</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
