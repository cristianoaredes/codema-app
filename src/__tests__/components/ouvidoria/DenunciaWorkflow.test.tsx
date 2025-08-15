import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DenunciaWorkflow from '@/components/ouvidoria/DenunciaWorkflow';
import * as useOuvidoriaDenunciasModule from '@/hooks/useOuvidoriaDenuncias';

vi.mock('@/hooks/useOuvidoriaDenuncias');

const mockDenuncia = {
  id: '1',
  protocolo: 'OUV-001/2024',
  status: 'recebida',
  tipo_denuncia: 'desmatamento',
  descricao: 'Teste de denúncia',
  local_ocorrencia: 'Local teste',
  prioridade: 'alta',
  created_at: '2024-01-01T10:00:00Z'
};

const mockUpdateStatus = vi.fn();
const mockAtribuirFiscal = vi.fn();

describe('DenunciaWorkflow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    vi.clearAllMocks();
    
    vi.mocked(useOuvidoriaDenunciasModule).useFiscais = vi.fn().mockReturnValue({
      data: [
        { id: '1', full_name: 'Fiscal 1', email: 'fiscal1@test.com' },
        { id: '2', full_name: 'Fiscal 2', email: 'fiscal2@test.com' }
      ],
      isLoading: false
    });
    
    vi.mocked(useOuvidoriaDenunciasModule).useUpdateOuvidoriaStatus = vi.fn().mockReturnValue({
      mutateAsync: mockUpdateStatus
    });
    
    vi.mocked(useOuvidoriaDenunciasModule).useAtribuirFiscal = vi.fn().mockReturnValue({
      mutateAsync: mockAtribuirFiscal
    });
  });

  const renderComponent = (canManage = false) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DenunciaWorkflow 
          denuncia={mockDenuncia} 
          onUpdate={vi.fn()} 
          canManage={canManage} 
        />
      </QueryClientProvider>
    );
  };

  it('renderiza informações do workflow corretamente', () => {
    renderComponent();
    
    expect(screen.getByText(/Workflow da Denúncia/i)).toBeInTheDocument();
    expect(screen.getByText(/OUV-001\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/recebida/i)).toBeInTheDocument();
  });

  it('mostra ações disponíveis quando canManage é true', () => {
    renderComponent(true);
    
    expect(screen.getByText(/Ações Disponíveis/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Atualizar Status/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Atribuir Fiscal/i })).toBeInTheDocument();
  });

  it('não mostra ações quando canManage é false', () => {
    renderComponent(false);
    
    expect(screen.queryByText(/Ações Disponíveis/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Atualizar Status/i })).not.toBeInTheDocument();
  });

  it('permite atualização de status', async () => {
    const user = userEvent.setup();
    renderComponent(true);
    
    const updateButton = screen.getByRole('button', { name: /Atualizar Status/i });
    await user.click(updateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Atualizar Status da Denúncia/i)).toBeInTheDocument();
    });
    
    const statusSelect = screen.getByRole('combobox');
    await user.click(statusSelect);
    
    const option = screen.getByRole('option', { name: /Em Apuração/i });
    await user.click(option);
    
    const confirmButton = screen.getByRole('button', { name: /Confirmar/i });
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith({
        id: '1',
        status: 'em_apuracao'
      });
    });
  });

  it('permite atribuição de fiscal', async () => {
    const user = userEvent.setup();
    renderComponent(true);
    
    const assignButton = screen.getByRole('button', { name: /Atribuir Fiscal/i });
    await user.click(assignButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Atribuir Fiscal Responsável/i)).toBeInTheDocument();
    });
    
    const fiscalSelect = screen.getByRole('combobox');
    await user.click(fiscalSelect);
    
    const fiscalOption = screen.getByRole('option', { name: /Fiscal 1/i });
    await user.click(fiscalOption);
    
    const confirmButton = screen.getByRole('button', { name: /Atribuir/i });
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockAtribuirFiscal).toHaveBeenCalledWith({
        denuncia_id: '1',
        fiscal_id: '1'
      });
    });
  });
});