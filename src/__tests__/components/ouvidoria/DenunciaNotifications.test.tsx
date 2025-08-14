import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DenunciaNotifications from '@/components/ouvidoria/DenunciaNotifications';
import * as useOuvidoriaNotificationsModule from '@/hooks/useOuvidoriaNotifications';

vi.mock('@/hooks/useOuvidoriaNotifications');

const mockDenuncia = {
  id: '1',
  protocolo: 'OUV-001/2024',
  status: 'em_apuracao',
  denunciante_email: 'denunciante@test.com',
  denunciante_telefone: '11999999999'
};

const mockNotificacoes = [
  {
    id: '1',
    denuncia_id: '1',
    tipo: 'email',
    destinatario: 'denunciante@test.com',
    assunto: 'Status atualizado',
    conteudo: 'Sua denúncia foi atualizada',
    status: 'enviado',
    data_envio: '2024-01-02T10:00:00Z'
  },
  {
    id: '2',
    denuncia_id: '1',
    tipo: 'sms',
    destinatario: '11999999999',
    assunto: 'Fiscal atribuído',
    conteudo: 'Um fiscal foi designado para sua denúncia',
    status: 'pendente',
    data_envio: null
  }
];

const mockEnviarNotificacao = vi.fn();
const mockReenviarNotificacao = vi.fn();
const mockConfigurarNotificacoes = vi.fn();

describe('DenunciaNotifications', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    vi.clearAllMocks();
    
    vi.mocked(useOuvidoriaNotificationsModule).useOuvidoriaNotifications = vi.fn().mockReturnValue({
      notificacoes: mockNotificacoes,
      loading: false,
      enviarNotificacao: mockEnviarNotificacao,
      reenviarNotificacao: mockReenviarNotificacao,
      configurarNotificacoes: mockConfigurarNotificacoes,
      buscarNotificacoesDenuncia: vi.fn(),
      buscarNotificacoesPendentes: vi.fn()
    });
  });

  const renderComponent = (canManage = false) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DenunciaNotifications 
          denuncia={mockDenuncia} 
          canManage={canManage} 
        />
      </QueryClientProvider>
    );
  };

  it('renderiza as notificações corretamente', () => {
    renderComponent();
    
    expect(screen.getByText(/Sistema de Notificações/i)).toBeInTheDocument();
    expect(screen.getByText(/Gerenciamento de notificações automáticas/i)).toBeInTheDocument();
  });

  it('exibe a lista de notificações', () => {
    renderComponent();
    
    expect(screen.getByText(/Status atualizado/i)).toBeInTheDocument();
    expect(screen.getByText(/Fiscal atribuído/i)).toBeInTheDocument();
    expect(screen.getByText(/denunciante@test.com/i)).toBeInTheDocument();
  });

  it('mostra status das notificações', () => {
    renderComponent();
    
    expect(screen.getByText(/Enviado/i)).toBeInTheDocument();
    expect(screen.getByText(/Pendente/i)).toBeInTheDocument();
  });

  it('mostra botão de nova notificação quando permitido', () => {
    renderComponent(true);
    
    expect(screen.getByRole('button', { name: /Nova Notificação/i })).toBeInTheDocument();
  });

  it('não mostra botão quando não permitido', () => {
    renderComponent(false);
    
    expect(screen.queryByRole('button', { name: /Nova Notificação/i })).not.toBeInTheDocument();
  });

  it('permite enviar nova notificação', async () => {
    const user = userEvent.setup();
    renderComponent(true);
    
    const newButton = screen.getByRole('button', { name: /Nova Notificação/i });
    await user.click(newButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Enviar Nova Notificação/i)).toBeInTheDocument();
    });
    
    const tipoSelect = screen.getByRole('combobox', { name: /Tipo/i });
    await user.click(tipoSelect);
    
    const emailOption = screen.getByRole('option', { name: /E-mail/i });
    await user.click(emailOption);
    
    const assuntoInput = screen.getByPlaceholderText(/Assunto da notificação/i);
    await user.type(assuntoInput, 'Teste de notificação');
    
    const conteudoInput = screen.getByPlaceholderText(/Conteúdo da mensagem/i);
    await user.type(conteudoInput, 'Conteúdo de teste');
    
    const enviarButton = screen.getByRole('button', { name: /Enviar/i });
    await user.click(enviarButton);
    
    await waitFor(() => {
      expect(mockEnviarNotificacao).toHaveBeenCalledWith({
        denuncia_id: '1',
        tipo: 'email',
        destinatario: 'denunciante@test.com',
        assunto: 'Teste de notificação',
        conteudo: 'Conteúdo de teste'
      });
    });
  });

  it('permite reenviar notificação pendente', async () => {
    const user = userEvent.setup();
    renderComponent(true);
    
    const reenviarButtons = screen.getAllByRole('button', { name: /Reenviar/i });
    await user.click(reenviarButtons[0]);
    
    await waitFor(() => {
      expect(mockReenviarNotificacao).toHaveBeenCalledWith('2');
    });
  });

  it('mostra configurações de notificação quando permitido', async () => {
    const user = userEvent.setup();
    renderComponent(true);
    
    const configButton = screen.getByRole('button', { name: /Configurações/i });
    await user.click(configButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Configurar Notificações Automáticas/i)).toBeInTheDocument();
    });
    
    const checkbox = screen.getByRole('checkbox', { name: /Notificar mudanças de status/i });
    await user.click(checkbox);
    
    const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockConfigurarNotificacoes).toHaveBeenCalled();
    });
  });

  it('exibe estado vazio quando não há notificações', () => {
    vi.mocked(useOuvidoriaNotificationsModule).useOuvidoriaNotifications = vi.fn().mockReturnValue({
      notificacoes: [],
      loading: false,
      enviarNotificacao: mockEnviarNotificacao,
      reenviarNotificacao: mockReenviarNotificacao,
      configurarNotificacoes: mockConfigurarNotificacoes,
      buscarNotificacoesDenuncia: vi.fn(),
      buscarNotificacoesPendentes: vi.fn()
    });
    
    renderComponent();
    
    expect(screen.getByText(/Nenhuma notificação enviada/i)).toBeInTheDocument();
  });
});