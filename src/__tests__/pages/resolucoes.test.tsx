import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render as rtlRender, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResolucoesPage from '@/pages/codema/resolucoes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

// Mock do hook de auth para controlar roles
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    profile: { id: 'u1', role: 'admin', is_acting_president: false },
    loading: false,
  }),
}))

// Mock simples do Supabase para consultas encadeadas
const mockResolucoes = [
  { id: '1', numero: '10/2025', titulo: 'Res A', ementa: 'E1', tipo: 'normativa', status: 'minuta', votos_favor: 0, votos_contra: 0, abstencoes: 0, quorum_presente: 0, resultado_votacao: null, pdf_gerado: false, created_at: new Date().toISOString(), created_by: 'u1', profiles: { full_name: 'Admin' } },
  { id: '2', numero: '09/2025', titulo: 'Res B', ementa: 'E2', tipo: 'deliberativa', status: 'em_votacao', votos_favor: 5, votos_contra: 2, abstencoes: 1, quorum_presente: 8, resultado_votacao: 'aprovada', pdf_gerado: false, created_at: new Date().toISOString(), created_by: 'u1', profiles: { full_name: 'Admin' } },
  { id: '3', numero: '08/2025', titulo: 'Res C', ementa: 'E3', tipo: 'administrativa', status: 'publicada', votos_favor: 0, votos_contra: 0, abstencoes: 0, quorum_presente: 0, resultado_votacao: null, pdf_gerado: true, created_at: new Date().toISOString(), created_by: 'u1', profiles: { full_name: 'Admin' } },
]

vi.mock('@/integrations/supabase/client', () => {
  const buildThenable = (data: unknown) => ({
    select: () => buildThenable(data),
    order: () => buildThenable(data),
    eq: () => buildThenable(data),
    or: () => buildThenable(data),
    then: (resolve: (result: { data: unknown; error: null }) => unknown) => Promise.resolve(resolve({ data, error: null })),
  })
  return {
    supabase: {
      from: (table: string) => {
        if (table === 'resolucoes') {
          return buildThenable(mockResolucoes)
        }
        return buildThenable([])
      },
    },
  }
})

describe('Página de Resoluções', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza lista e mostra ação de Nova Resolução para admin', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    rtlRender(
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <ResolucoesPage />
        </BrowserRouter>
      </QueryClientProvider>
    )

    await waitFor(() => expect(screen.getByText(/Resoluções do CODEMA/i)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Nova Resolução/i })).toBeInTheDocument()

    // Filtros básicos
    const search = screen.getByPlaceholderText(/Buscar por número, título ou ementa/i)
    await userEvent.type(search, 'Res')
  })

  it('mostra estatísticas calculadas', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    rtlRender(
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <ResolucoesPage />
        </BrowserRouter>
      </QueryClientProvider>
    )
    await waitFor(() => expect(screen.getByText(/Total/i)).toBeInTheDocument())
    // Total deve ser 3 baseado no mock
    expect(screen.getAllByText('3')[0]).toBeInTheDocument()
  })

  it('abre o diálogo de Nova Resolução ao clicar no botão', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    rtlRender(
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <ResolucoesPage />
        </BrowserRouter>
      </QueryClientProvider>
    )

    await waitFor(() => expect(screen.getByText(/Resoluções do CODEMA/i)).toBeInTheDocument())
    const btns = screen.getAllByRole('button', { name: /Nova Resolução/i })
    const btn = btns[0] // Use the first button found
    await userEvent.click(btn)
    // O diálogo deve abrir com título
    await waitFor(() => {
      const dialogTitle = screen.getByRole('heading', { name: /Nova Resolução/i })
      expect(dialogTitle).toBeInTheDocument()
    })
  })
})
