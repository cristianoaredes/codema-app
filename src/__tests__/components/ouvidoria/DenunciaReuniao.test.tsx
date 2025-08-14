import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DenunciaReuniao from '@/components/ouvidoria/DenunciaReuniao';
import * as useOuvidoriaReunioesModule from '@/hooks/useOuvidoriaReunioes';
import * as useReunioesModule from '@/hooks/useReunioes';
import * as useConselheirosModule from '@/hooks/useConselheiros';

vi.mock('@/hooks/useOuvidoriaReunioes');
vi.mock('@/hooks/useReunioes');
vi.mock('@/hooks/useConselheiros');

const mockDenuncia = {
  id: '1',
  protocolo: 'OUV-001/2024',
  status: 'em_apuracao',
  tipo_denuncia: 'desmatamento'
};

const mockReunioes = [
  {
    id: 'r1',
    numero_reuniao: 123,
    data_reuniao: '2024-12-01T10:00:00Z',
    tipo: 'ordinaria',
    status: 'agendada'
  },
  {
    id: 'r2',
    numero_reuniao: 124,
    data_reuniao: '2024-12-15T10:00:00Z',
    tipo: 'extraordinaria',
    status: 'agendada'
  }
];

const mockConselheiros = [
  {
    id: 'c1',
    user_id: 'u1',
    nome: 'João Silva',
    tipo: 'titular',
    status: 'ativo'
  },
  {
    id: 'c2',
    user_id: 'u2',
    nome: 'Maria Santos',
    tipo: 'suplente',
    status: 'ativo'
  }
];

const mockDenunciasReuniao = [
  {
    id: 'dr1',
    denuncia_id: '1',
    reuniao_id: 'r1',
    status: 'pendente',
    ordem_pauta: 3,
    relator: { full_name: 'João Silva' },
    parecer: 'Parecer técnico sobre a denúncia',
    votos_favoraveis: null,
    votos_contrarios: null,
    abstencoes: null,
    decisao: null,
    reuniao: mockReunioes[0]
  }
];

const mockEstatisticas = {
  total: 10,
  pendentes: 3,
  votadas: 7,
  procedentes: 5
};

describe('DenunciaReuniao', () => {
  let queryClient: QueryClient;
  const mockAdicionarDenunciaPauta = vi.fn();
  const mockRegistrarVotacao = vi.fn();
  const mockAtualizarParecer = vi.fn();
  const mockRemoverDenunciaPauta = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    vi.clearAllMocks();
    
    vi.mocked(useOuvidoriaReunioesModule).useOuvidoriaReunioes = vi.fn().mockReturnValue({
      loading: false,
      denunciasReuniao: mockDenunciasReuniao,
      adicionarDenunciaPauta: mockAdicionarDenunciaPauta,
      buscarReunioesDenuncia: vi.fn().mockResolvedValue(mockDenunciasReuniao),
      registrarVotacao: mockRegistrarVotacao,
      atualizarParecer: mockAtualizarParecer,
      removerDenunciaPauta: mockRemoverDenunciaPauta,
      buscarEstatisticas: vi.fn().mockResolvedValue(mockEstatisticas)
    });
    
    vi.mocked(useReunioesModule).useReunioes = vi.fn().mockReturnValue({
      reunioes: mockReunioes,
      buscarReunioes: vi.fn()
    });
    
    vi.mocked(useConselheirosModule).useConselheiros = vi.fn().mockReturnValue({
      conselheiros: mockConselheiros,
      buscarConselheiros: vi.fn()
    });
  });

  const renderComponent = (canManage = false) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DenunciaReuniao 
          denuncia={mockDenuncia} 
          canManage={canManage} 
        />
      </QueryClientProvider>
    );
  };

  it('renderiza o componente com título e descrição', () => {
    renderComponent();
    
    expect(screen.getByText(/Integração com Reuniões/i)).toBeInTheDocument();
    expect(screen.getByText(/Acompanhe a tramitação desta denúncia nas reuniões do CODEMA/i)).toBeInTheDocument();
  });

  it('exibe estatísticas quando disponíveis', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Total
      expect(screen.getByText('3')).toBeInTheDocument(); // Pendentes
      expect(screen.getByText('7')).toBeInTheDocument(); // Votadas
      expect(screen.getByText(/50%/)).toBeInTheDocument(); // Taxa de procedência
    });
  });

  it('mostra botão de adicionar à pauta quando permitido', () => {
    renderComponent(true);
    
    expect(screen.getByRole('button', { name: /Adicionar à Pauta/i })).toBeInTheDocument();
  });

  it('não mostra botão quando não permitido', () => {
    renderComponent(false);
    
    expect(screen.queryByRole('button', { name: /Adicionar à Pauta/i })).not.toBeInTheDocument();
  });

  it('exibe histórico de reuniões', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Reunião #123/i)).toBeInTheDocument();
      expect(screen.getByText(/João Silva/i)).toBeInTheDocument();
      expect(screen.getByText(/Parecer técnico sobre a denúncia/i)).toBeInTheDocument();
    });
  });

  it('permite adicionar denúncia à pauta', async () => {
    const user = userEvent.setup();
    renderComponent(true);
    
    const addButton = screen.getByRole('button', { name: /Adicionar à Pauta/i });
    await user.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Adicionar Denúncia à Pauta/i)).toBeInTheDocument();
    });
    
    const reuniaoSelect = screen.getByRole('combobox', { name: /Reunião/i });
    await user.click(reuniaoSelect);
    
    const reuniaoOption = screen.getByRole('option', { name: /Reunião #123/i });
    await user.click(reuniaoOption);
    
    const relatorSelect = screen.getByRole('combobox', { name: /Relator/i });
    await user.click(relatorSelect);
    
    const relatorOption = screen.getByRole('option', { name: /João Silva/i });
    await user.click(relatorOption);
    
    const confirmButton = screen.getByRole('button', { name: /Adicionar à Pauta/i });
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockAdicionarDenunciaPauta).toHaveBeenCalledWith(
        '1',
        'r1',
        undefined,
        'u1'
      );
    });
  });

  it('permite registrar votação', async () => {
    const user = userEvent.setup();
    renderComponent(true);
    
    await waitFor(() => {
      expect(screen.getByText(/Reunião #123/i)).toBeInTheDocument();
    });
    
    const votarButton = screen.getByRole('button', { name: /Registrar Votação/i });
    await user.click(votarButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Registrar Votação/i)).toBeInTheDocument();
    });
    
    const favoraveisInput = screen.getByRole('spinbutton', { name: /Favoráveis/i });
    await user.clear(favoraveisInput);
    await user.type(favoraveisInput, '5');
    
    const contrariosInput = screen.getByRole('spinbutton', { name: /Contrários/i });
    await user.clear(contrariosInput);
    await user.type(contrariosInput, '2');
    
    const decisaoSelect = screen.getByRole('combobox', { name: /Decisão/i });
    await user.click(decisaoSelect);
    
    const decisaoOption = screen.getByRole('option', { name: /Procedente/i });
    await user.click(decisaoOption);
    
    const registrarButton = screen.getByRole('button', { name: /Registrar Votação/i });
    await user.click(registrarButton);
    
    await waitFor(() => {
      expect(mockRegistrarVotacao).toHaveBeenCalled();
    });
  });

  it('exibe tabs de histórico e próximas reuniões', () => {
    renderComponent();
    
    expect(screen.getByRole('tab', { name: /Histórico/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Próximas Reuniões/i })).toBeInTheDocument();
  });

  it('mostra mensagem quando não há reuniões', () => {
    vi.mocked(useOuvidoriaReunioesModule).useOuvidoriaReunioes = vi.fn().mockReturnValue({
      loading: false,
      denunciasReuniao: [],
      adicionarDenunciaPauta: mockAdicionarDenunciaPauta,
      buscarReunioesDenuncia: vi.fn().mockResolvedValue([]),
      registrarVotacao: mockRegistrarVotacao,
      atualizarParecer: mockAtualizarParecer,
      removerDenunciaPauta: mockRemoverDenunciaPauta,
      buscarEstatisticas: vi.fn().mockResolvedValue(mockEstatisticas)
    });
    
    renderComponent();
    
    expect(screen.getByText(/Esta denúncia ainda não foi incluída em nenhuma reunião/i)).toBeInTheDocument();
  });
});