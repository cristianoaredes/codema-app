import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf,
  Font
} from '@react-pdf/renderer';
import { supabase } from '@/integrations/supabase/client';

// Register fonts for better support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Tipos para os dados da lista de presença
interface AttendanceMember {
  id: string;
  nome_completo: string;
  entidade_representada: string;
  cargo?: string;
  presente?: boolean;
  horario_chegada?: string;
}

interface MeetingInfo {
  id: string;
  titulo: string;
  tipo: string;
  data_reuniao: string;
  local: string;
  protocolo?: string;
  numero_reuniao?: string;
}

interface AttendanceListData {
  meeting: MeetingInfo;
  members: AttendanceMember[];
  generatedAt: Date;
}

// Estilos para o PDF A4 Paisagem
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'medium',
    marginBottom: 3,
    textAlign: 'center',
  },
  meetingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoColumn: {
    flex: 1,
    paddingHorizontal: 10,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'normal',
    marginBottom: 8,
  },
  table: {
    width: '100%',
    border: 1,
    borderColor: '#d1d5db',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottom: 1,
    borderBottomColor: '#d1d5db',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 5,
    minHeight: 40,
  },
  tableCell: {
    fontSize: 9,
    paddingHorizontal: 3,
    paddingVertical: 2,
    textAlign: 'left',
  },
  headerCell: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#374151',
  },
  numberColumn: {
    width: '8%',
    textAlign: 'center',
  },
  nameColumn: {
    width: '35%',
  },
  entityColumn: {
    width: '30%',
  },
  signatureColumn: {
    width: '27%',
    borderLeft: 1,
    borderLeftColor: '#e5e7eb',
    paddingLeft: 5,
  },
  signatureLine: {
    borderBottom: 1,
    borderBottomColor: '#9ca3af',
    height: 20,
    marginTop: 10,
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: 1,
    borderTopColor: '#e2e8f0',
    fontSize: 8,
    color: '#6b7280',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    border: 1,
    borderColor: '#e5e7eb',
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 'medium',
  },
});

// Componente PDF para Lista de Presença
const AttendanceListPDF = ({ data }: { data: AttendanceListData }) => {
  const { meeting, members, generatedAt } = data;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalMembers = members.length;
  const presentMembers = members.filter(m => m.presente).length;
  const absentMembers = totalMembers - presentMembers;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>
            CONSELHO MUNICIPAL DE DEFESA DO MEIO AMBIENTE - CODEMA
          </Text>
          <Text style={styles.subtitle}>
            Prefeitura Municipal de Itanhomi/MG
          </Text>
          <Text style={styles.subtitle}>
            LISTA DE PRESENÇA - {meeting.tipo.toUpperCase()}
          </Text>
        </View>

        {/* Informações da Reunião */}
        <View style={styles.meetingInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>TÍTULO DA REUNIÃO:</Text>
            <Text style={styles.infoValue}>{meeting.titulo}</Text>
            
            <Text style={styles.infoLabel}>DATA E HORÁRIO:</Text>
            <Text style={styles.infoValue}>{formatDateTime(meeting.data_reuniao)}</Text>
          </View>
          
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>LOCAL:</Text>
            <Text style={styles.infoValue}>{meeting.local}</Text>
            
            <Text style={styles.infoLabel}>PROTOCOLO:</Text>
            <Text style={styles.infoValue}>{meeting.protocolo || 'A definir'}</Text>
          </View>
          
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>NÚMERO DA REUNIÃO:</Text>
            <Text style={styles.infoValue}>{meeting.numero_reuniao || 'A definir'}</Text>
            
            <Text style={styles.infoLabel}>DOCUMENTO GERADO EM:</Text>
            <Text style={styles.infoValue}>{formatDateTime(generatedAt.toISOString())}</Text>
          </View>
        </View>

        {/* Tabela de Presença */}
        <View style={styles.table}>
          {/* Cabeçalho da Tabela */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.numberColumn]}>Nº</Text>
            <Text style={[styles.headerCell, styles.nameColumn]}>NOME COMPLETO</Text>
            <Text style={[styles.headerCell, styles.entityColumn]}>ENTIDADE/ORGANIZAÇÃO</Text>
            <Text style={[styles.headerCell, styles.signatureColumn]}>ASSINATURA</Text>
          </View>

          {/* Linhas da Tabela */}
          {members.map((member, index) => (
            <View key={member.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.numberColumn]}>
                {(index + 1).toString().padStart(2, '0')}
              </Text>
              <Text style={[styles.tableCell, styles.nameColumn]}>
                {member.nome_completo}
                {member.cargo && ` (${member.cargo})`}
              </Text>
              <Text style={[styles.tableCell, styles.entityColumn]}>
                {member.entidade_representada || 'Não informado'}
              </Text>
              <View style={[styles.tableCell, styles.signatureColumn]}>
                <View style={styles.signatureLine} />
              </View>
            </View>
          ))}
        </View>

        {/* Resumo */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>RESUMO DA PRESENÇA</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Conselheiros Convocados:</Text>
            <Text style={styles.summaryValue}>{totalMembers}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Presentes:</Text>
            <Text style={styles.summaryValue}>{presentMembers}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ausentes:</Text>
            <Text style={styles.summaryValue}>{absentMembers}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quórum Atingido:</Text>
            <Text style={styles.summaryValue}>
              {presentMembers >= Math.ceil(totalMembers / 2) ? 'SIM' : 'NÃO'}
            </Text>
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text>Documento gerado automaticamente pelo Sistema CODEMA</Text>
            <Text>Página 1 de 1</Text>
          </View>
          <View style={styles.footerRow}>
            <Text>Data/Hora de geração: {formatDateTime(generatedAt.toISOString())}</Text>
            <Text>Prefeitura Municipal de Itanhomi/MG</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Busca dados da reunião e membros do CODEMA
 */
async function fetchMeetingData(meetingId: string): Promise<AttendanceListData> {
  // Buscar dados da reunião
  const { data: meeting, error: meetingError } = await supabase
    .from('reunioes')
    .select('*')
    .eq('id', meetingId)
    .single();

  if (meetingError) {
    throw new Error(`Erro ao buscar dados da reunião: ${meetingError.message}`);
  }

  if (!meeting) {
    throw new Error('Reunião não encontrada');
  }

  // Buscar conselheiros convocados ou presentes
  let members: AttendanceMember[] = [];

  // Primeiro, tentar buscar presenças registradas
  const { data: presencas, error: presencasError } = await supabase
    .from('presencas')
    .select(`
      *,
      profiles!presencas_conselheiro_id_fkey(
        id,
        nome_completo,
        entidade_representada
      )
    `)
    .eq('reuniao_id', meetingId);

  if (!presencasError && presencas && presencas.length > 0) {
    // Se há presenças registradas, usar esses dados
    members = presencas.map((presenca) => ({
      id: presenca.conselheiro_id,
      nome_completo: presenca.profiles?.nome_completo || 'Nome não informado',
      entidade_representada: presenca.profiles?.entidade_representada || 'Entidade não informada',
      presente: presenca.presente || false,
      horario_chegada: presenca.horario_chegada || undefined,
    }));
  } else {
    // Se não há presenças, buscar todos os conselheiros ativos
    const { data: conselheiros, error: conselheirosError } = await supabase
      .from('conselheiros')
      .select(`
        id,
        profiles!conselheiros_profile_id_fkey(
          id,
          nome_completo,
          entidade_representada
        )
      `)
      .eq('status', 'ativo')
      .order('profiles(nome_completo)');

    if (conselheirosError) {
      throw new Error(`Erro ao buscar conselheiros: ${conselheirosError.message}`);
    }

    members = (conselheiros || []).map((conselheiro) => ({
      id: conselheiro.id,
      nome_completo: conselheiro.profiles?.nome_completo || 'Nome não informado',
      entidade_representada: conselheiro.profiles?.entidade_representada || 'Entidade não informada',
      presente: false,
    }));
  }

  // Ordenar membros por nome
  members.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));

  return {
    meeting: {
      id: meeting.id,
      titulo: meeting.titulo,
      tipo: meeting.tipo,
      data_reuniao: meeting.data_reuniao,
      local: meeting.local,
      protocolo: meeting.protocolo,
      numero_reuniao: meeting.numero_reuniao?.toString(),
    },
    members,
    generatedAt: new Date(),
  };
}

/**
 * Gera PDF da lista de presença em formato A4 paisagem
 */
export async function generateAttendanceListPDF(meetingId: string): Promise<Blob> {
  try {
    // Buscar dados necessários
    const data = await fetchMeetingData(meetingId);

    // Gerar documento PDF
    const doc = React.createElement(AttendanceListPDF, { data });
    const pdfBlob = await pdf(doc).toBlob();

    return pdfBlob;
  } catch (error) {
    console.error('Erro ao gerar PDF da lista de presença:', error);
    throw error;
  }
}

/**
 * Gera e baixa PDF da lista de presença
 */
export async function downloadAttendanceListPDF(meetingId: string): Promise<void> {
  try {
    const pdfBlob = await generateAttendanceListPDF(meetingId);
    
    // Buscar título da reunião para nome do arquivo
    const { data: meeting } = await supabase
      .from('reunioes')
      .select('titulo, data_reuniao')
      .eq('id', meetingId)
      .single();

    const fileName = meeting 
      ? `Lista_Presenca_${meeting.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(meeting.data_reuniao).toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`
      : `Lista_Presenca_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;

    // Criar link de download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar PDF da lista de presença:', error);
    throw error;
  }
}

/**
 * Visualiza PDF da lista de presença em nova aba
 */
export async function previewAttendanceListPDF(meetingId: string): Promise<void> {
  try {
    const pdfBlob = await generateAttendanceListPDF(meetingId);
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Erro ao visualizar PDF da lista de presença:', error);
    throw error;
  }
}

export { AttendanceListPDF };
export type { AttendanceListData, MeetingInfo, AttendanceMember };