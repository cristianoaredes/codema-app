import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render as rtlRender, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NovaReuniao from '@/pages/reunioes/NovaReuniao'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

// Mock useAuth para fornecer profile com id
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ profile: { id: 'sec-1', role: 'secretario' } }) }))

// Mock useToast para não abrir toasts reais
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: () => {} }) }))

// Mock useNavigate para capturar navegação
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig() as typeof import('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock supabase insert
const insertSpy = vi.fn(() => Promise.resolve({ error: null }))
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'reunioes') {
        return { insert: insertSpy }
      }
      return { insert: vi.fn(() => Promise.resolve({ error: null })) }
    },
  },
}))

describe('Nova Reunião', () => {
  it('valida, mapeia campos e envia com sucesso', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    rtlRender(
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <NovaReuniao />
        </BrowserRouter>
      </QueryClientProvider>
    )

    // Preenche campos
    await userEvent.type(screen.getByLabelText(/Título da Reunião/i), 'Reunião Teste')
    // Tipo já default: ordinaria
    await userEvent.type(screen.getByLabelText(/Data e Hora/i), '2025-01-20T10:30')
    await userEvent.type(screen.getByLabelText(/Local da Reunião/i), 'Câmara Municipal')
    await userEvent.type(screen.getByLabelText(/Descrição \(Opcional\)/i), 'Descrição breve')

    // Envia
    await userEvent.click(screen.getByRole('button', { name: /Criar Reunião/i }))

    await waitFor(() => expect(insertSpy).toHaveBeenCalled())
    const payload = insertSpy.mock.calls[0][0]
    expect(payload.titulo).toBe('Reunião Teste')
    expect(payload.tipo).toBe('ordinaria')
    expect(payload.data_reuniao).toBe('2025-01-20T10:30')
    expect(payload.local).toBe('Câmara Municipal')
    expect(payload.status).toBe('agendada')
    expect(payload.secretario_id).toBe('sec-1')

    // navegação pós-sucesso
    expect(mockNavigate).toHaveBeenCalledWith('/reunioes')
  })
})

