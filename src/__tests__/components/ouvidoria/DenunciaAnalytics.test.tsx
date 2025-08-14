import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DenunciaAnalytics from '@/components/ouvidoria/DenunciaAnalytics';

const mockDenuncias = [
  {
    id: '1',
    protocolo: 'OUV-001/2024',
    status: 'procedente',
    tipo_denuncia: 'desmatamento',
    prioridade: 'alta',
    created_at: '2024-01-01T10:00:00Z',
    data_fiscalizacao: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    protocolo: 'OUV-002/2024',
    status: 'em_apuracao',
    tipo_denuncia: 'poluicao_agua',
    prioridade: 'urgente',
    created_at: '2024-01-05T10:00:00Z',
    data_fiscalizacao: null
  },
  {
    id: '3',
    protocolo: 'OUV-003/2024',
    status: 'improcedente',
    tipo_denuncia: 'desmatamento',
    prioridade: 'normal',
    created_at: '2024-01-10T10:00:00Z',
    data_fiscalizacao: '2024-01-20T10:00:00Z'
  },
  {
    id: '4',
    protocolo: 'OUV-004/2024',
    status: 'recebida',
    tipo_denuncia: 'queima_lixo',
    prioridade: 'baixa',
    created_at: '2024-02-01T10:00:00Z',
    data_fiscalizacao: null
  }
];

describe('DenunciaAnalytics', () => {
  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <DenunciaAnalytics denuncias={mockDenuncias} />
      </QueryClientProvider>
    );
  };

  it('renderiza o título e descrição', () => {
    renderComponent();
    
    expect(screen.getByText(/Analytics do Sistema de Ouvidoria/i)).toBeInTheDocument();
    expect(screen.getByText(/Análise estatística das denúncias ambientais/i)).toBeInTheDocument();
  });

  it('exibe as estatísticas gerais corretamente', () => {
    renderComponent();
    
    // Total de denúncias
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Taxa de procedência (1 procedente de 2 resolvidas = 50%)
    expect(screen.getByText('50%')).toBeInTheDocument();
    
    // Tempo médio de resolução
    expect(screen.getByText(/dias/i)).toBeInTheDocument();
  });

  it('renderiza os gráficos', () => {
    renderComponent();
    
    expect(screen.getByText(/Distribuição por Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Distribuição por Tipo/i)).toBeInTheDocument();
    expect(screen.getByText(/Distribuição por Prioridade/i)).toBeInTheDocument();
    expect(screen.getByText(/Tendência Mensal/i)).toBeInTheDocument();
  });

  it('exibe os indicadores de performance', () => {
    renderComponent();
    
    expect(screen.getByText(/Indicadores de Performance/i)).toBeInTheDocument();
    expect(screen.getByText(/Taxa de Resolução/i)).toBeInTheDocument();
    expect(screen.getByText(/Denúncias Urgentes/i)).toBeInTheDocument();
    expect(screen.getByText(/Aguardando Fiscal/i)).toBeInTheDocument();
  });

  it('mostra as estatísticas por tipo', () => {
    renderComponent();
    
    expect(screen.getByText(/Estatísticas por Tipo de Denúncia/i)).toBeInTheDocument();
    expect(screen.getByText(/Desmatamento/i)).toBeInTheDocument();
    expect(screen.getByText(/Poluição da Água/i)).toBeInTheDocument();
    expect(screen.getByText(/Queima de Lixo/i)).toBeInTheDocument();
  });

  it('calcula corretamente as estatísticas por tipo', () => {
    renderComponent();
    
    // Desmatamento: 2 denúncias (50%)
    const desmatamentoCards = screen.getAllByText(/Desmatamento/i);
    expect(desmatamentoCards.length).toBeGreaterThan(0);
    
    // Taxa de procedência do desmatamento: 1 procedente de 2 = 50%
    const taxasElement = screen.getAllByText(/50%/);
    expect(taxasElement.length).toBeGreaterThan(0);
  });
});