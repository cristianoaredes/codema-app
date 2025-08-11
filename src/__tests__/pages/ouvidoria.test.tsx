import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render as rtlRender, screen, waitFor } from '@testing-library/react'
import Ouvidoria from '@/pages/ouvidoria/Ouvidoria'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

// Mock do toast para evitar efeitos colaterais
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: () => {} }) }))

// Mock do hook de auth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, profile: { id: 'u1', role: 'admin' }, loading: false }),
}))

const mockDenuncias = [
  { id: 'd1', protocolo: 'OUV-0001', tipo_denuncia: 'desmatamento', descricao: 'Desc', local_ocorrencia: 'Praça', latitude: null, longitude: null, data_ocorrencia: null, denunciante_nome: null, denunciante_telefone: null, denunciante_email: null, anonima: true, status: 'recebida', prioridade: 'normal', fiscal_responsavel: null, relatorio_fiscalizacao: null, data_fiscalizacao: null, created_at: new Date().toISOString() },
]

vi.mock('@/integrations/supabase/client', () => {
  const buildThenable = (data: unknown) => ({
    select: () => buildThenable(data),
    order: () => buildThenable(data),
    in: () => buildThenable(data),
    eq: () => buildThenable(data),
    insert: () => Promise.resolve({ error: null }),
    rpc: () => Promise.resolve({ data: 'OUV-0002', error: null }),
    then: (resolve: (result: { data: unknown; error: null }) => unknown) => Promise.resolve(resolve({ data, error: null })),
  })
  return {
    supabase: {
      from: (table: string) => {
        if (table === 'ouvidoria_denuncias') return buildThenable(mockDenuncias)
        if (table === 'profiles') return buildThenable([{ id: 'u1', full_name: 'Fiscal A', role: 'admin', email: 'a@b.com' }])
        return buildThenable([])
      },
      rpc: () => Promise.resolve({ data: 'OUV-0002', error: null }),
    },
  }
})

describe('Página de Ouvidoria', () => {
  it('renderiza cabeçalho e total de denúncias', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    rtlRender(
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <Ouvidoria />
        </BrowserRouter>
      </QueryClientProvider>
    )
    await waitFor(() => expect(screen.getByText(/Ouvidoria Ambiental/i)).toBeInTheDocument())
    // Botão de nova denúncia disponível
    expect(screen.getByRole('button', { name: /Nova Denúncia/i })).toBeInTheDocument()
    // Total cards renderizados (pode aparecer em mais de um card)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
  })

  it('abre o diálogo de Nova Denúncia ao clicar no botão', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    rtlRender(
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <Ouvidoria />
        </BrowserRouter>
      </QueryClientProvider>
    )
    await waitFor(() => expect(screen.getByText(/Ouvidoria Ambiental/i)).toBeInTheDocument())
    const btn = screen.getByRole('button', { name: /Nova Denúncia/i })
    await btn.click()
    await waitFor(() => expect(screen.getByText(/Registrar Nova Denúncia/i)).toBeInTheDocument())
    // Campos-chave do formulário devem estar presentes
    expect(screen.getByLabelText(/Tipo de Denúncia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descrição da Denúncia/i)).toBeInTheDocument()
  })
})
