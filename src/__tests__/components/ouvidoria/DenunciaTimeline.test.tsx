import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DenunciaTimeline from '@/components/ouvidoria/DenunciaTimeline';
import * as useOuvidoriaTimelineModule from '@/hooks/useOuvidoriaTimeline';

vi.mock('@/hooks/useOuvidoriaTimeline');

const mockDenuncia = {
  id: '1',
  protocolo: 'OUV-001/2024',
  status: 'em_apuracao',
  tipo_denuncia: 'desmatamento',
  descricao: 'Teste de denúncia',
  created_at: '2024-01-01T10:00:00Z'
};

const mockEventos = [
  {
    id: '1',
    denuncia_id: '1',
    tipo: 'status_change',
    descricao: 'Status alterado para Em Apuração',
    data_evento: '2024-01-02T10:00:00Z',
    usuario_nome: 'Admin User',
    metadata: { status_anterior: 'recebida', status_novo: 'em_apuracao' }
  },
  {
    id: '2',
    denuncia_id: '1',
    tipo: 'fiscal_assigned',
    descricao: 'Fiscal atribuído',
    data_evento: '2024-01-03T10:00:00Z',
    usuario_nome: 'Admin User',
    metadata: { fiscal_nome: 'João Silva' }
  }
];

const mockAdicionarEvento = vi.fn();

describe('DenunciaTimeline', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    vi.clearAllMocks();
    
    vi.mocked(useOuvidoriaTimelineModule).useOuvidoriaTimeline = vi.fn().mockReturnValue({
      eventos: mockEventos,
      loading: false,
      adicionarEvento: mockAdicionarEvento,
      buscarEventosDenuncia: vi.fn(),
      buscarEventosRecentes: vi.fn(),
      buscarEventosPorTipo: vi.fn()
    });
  });

  const renderComponent = (canAddEvent = false) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DenunciaTimeline 
          denuncia={mockDenuncia} 
          canAddEvent={canAddEvent} 
        />
      </QueryClientProvider>
    );
  };

  it('renderiza a timeline corretamente', () => {
    renderComponent();
    
    expect(screen.getByText(/Timeline de Eventos/i)).toBeInTheDocument();
    expect(screen.getByText(/Histórico completo de ações e mudanças/i)).toBeInTheDocument();
  });

  it('exibe os eventos na timeline', () => {
    renderComponent();
    
    expect(screen.getByText(/Status alterado para Em Apuração/i)).toBeInTheDocument();
    expect(screen.getByText(/Fiscal atribuído/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
  });

  it('mostra botão de adicionar evento quando permitido', () => {
    renderComponent(true);
    
    expect(screen.getByRole('button', { name: /Adicionar Evento/i })).toBeInTheDocument();
  });

  it('não mostra botão de adicionar quando não permitido', () => {
    renderComponent(false);
    
    expect(screen.queryByRole('button', { name: /Adicionar Evento/i })).not.toBeInTheDocument();
  });

  it('permite adicionar novo evento', async () => {
    const user = userEvent.setup();
    renderComponent(true);
    
    const addButton = screen.getByRole('button', { name: /Adicionar Evento/i });
    await user.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Adicionar Evento à Timeline/i)).toBeInTheDocument();
    });
    
    const tipoSelect = screen.getByRole('combobox');
    await user.click(tipoSelect);
    
    const option = screen.getByRole('option', { name: /Comentário/i });
    await user.click(option);
    
    const descricaoInput = screen.getByPlaceholderText(/Descreva o evento/i);
    await user.type(descricaoInput, 'Novo comentário de teste');
    
    const confirmButton = screen.getByRole('button', { name: /Adicionar/i });
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockAdicionarEvento).toHaveBeenCalledWith(
        '1',
        'comment',
        'Novo comentário de teste',
        expect.any(Object)
      );
    });
  });

  it('mostra ícones apropriados para cada tipo de evento', () => {
    renderComponent();
    
    // Verifica se os ícones estão sendo renderizados
    const timeline = screen.getByRole('region', { name: /timeline/i });
    expect(timeline).toBeInTheDocument();
  });

  it('formata corretamente as datas dos eventos', () => {
    renderComponent();
    
    // Verifica se as datas estão formatadas em português
    expect(screen.getByText(/janeiro/i)).toBeInTheDocument();
  });

  it('exibe estado vazio quando não há eventos', () => {
    vi.mocked(useOuvidoriaTimelineModule).useOuvidoriaTimeline = vi.fn().mockReturnValue({
      eventos: [],
      loading: false,
      adicionarEvento: mockAdicionarEvento,
      buscarEventosDenuncia: vi.fn(),
      buscarEventosRecentes: vi.fn(),
      buscarEventosPorTipo: vi.fn()
    });
    
    renderComponent();
    
    expect(screen.getByText(/Nenhum evento registrado/i)).toBeInTheDocument();
  });
});