import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottom: 1,
    borderBottomColor: '#000000',
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 5,
  },
  info: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: 120,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
  },
  content: {
    textAlign: 'justify',
    lineHeight: 1.6,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: '#cccccc',
    textAlign: 'center',
    fontSize: 10,
  },
  signature: {
    marginTop: 40,
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: 1,
    borderTopColor: '#000000',
    width: 200,
    marginTop: 40,
    marginBottom: 5,
  },
  hash: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontSize: 8,
    fontFamily: 'Courier',
  },
});

interface AtaData {
  numero_ata: string;
  status: string;
  versao: number;
  conteudo: string;
  data_aprovacao: string | null;
  aprovador?: {
    full_name: string;
  };
  hash_verificacao: string | null;
  reuniao?: {
    numero_reuniao: string;
    tipo: string;
    data_hora: string;
    local: string;
  };
  created_at: string;
  updated_at: string;
}

// Componente PDF da Ata
const AtaPDFDocument = ({ ata }: { ata: AtaData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>
          CONSELHO MUNICIPAL DE DEFESA DO MEIO AMBIENTE
        </Text>
        <Text style={styles.subtitle}>
          CODEMA - Itanhomi/MG
        </Text>
        <Text style={styles.subtitle}>
          ATA Nº {ata.numero_ata}
        </Text>
        <Text>Versão {ata.versao} - Status: {ata.status}</Text>
      </View>

      {/* Informações da Reunião */}
      {ata.reuniao && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES DA REUNIÃO</Text>
          <View style={styles.info}>
            <Text style={styles.infoLabel}>Reunião:</Text>
            <Text style={styles.infoValue}>
              {ata.reuniao.numero_reuniao} ({ata.reuniao.tipo})
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.infoLabel}>Data/Hora:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(ata.reuniao.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.infoLabel}>Local:</Text>
            <Text style={styles.infoValue}>{ata.reuniao.local}</Text>
          </View>
        </View>
      )}

      {/* Conteúdo da Ata */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONTEÚDO</Text>
        <Text style={styles.content}>{ata.conteudo}</Text>
      </View>

      {/* Informações de Aprovação */}
      {ata.data_aprovacao && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APROVAÇÃO</Text>
          <View style={styles.info}>
            <Text style={styles.infoLabel}>Data de Aprovação:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(ata.data_aprovacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Text>
          </View>
          {ata.aprovador && (
            <View style={styles.info}>
              <Text style={styles.infoLabel}>Aprovada por:</Text>
              <Text style={styles.infoValue}>{ata.aprovador.full_name}</Text>
            </View>
          )}
        </View>
      )}

      {/* Assinatura */}
      <View style={styles.signature}>
        <View style={styles.signatureLine}></View>
        <Text>Presidente do CODEMA</Text>
        <Text>{ata.aprovador?.full_name || 'Nome do Aprovador'}</Text>
      </View>

      {/* Hash de Verificação */}
      {ata.hash_verificacao && (
        <View style={styles.hash}>
          <Text>Hash de Verificação de Integridade:</Text>
          <Text>{ata.hash_verificacao}</Text>
        </View>
      )}

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text>
          Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Text>
        <Text>
          Conselho Municipal de Defesa do Meio Ambiente - CODEMA Itanhomi/MG
        </Text>
      </View>
    </Page>
  </Document>
);

/**
 * Gera e baixa o PDF de uma ata
 */
export async function generateAtaPDF(ata: AtaData) {
  try {
    // Criar o documento PDF
    const doc = <AtaPDFDocument ata={ata} />;
    
    // Gerar o blob do PDF
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    
    // Criar URL e fazer download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATA_${ata.numero_ata}_v${ata.versao}.pdf`;
    
    // Simular clique para download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar URL
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}

/**
 * Gera o PDF e retorna como blob (para envio por email)
 */
export async function generateAtaPDFBlob(ata: AtaData): Promise<Blob> {
  try {
    const doc = <AtaPDFDocument ata={ata} />;
    const asPdf = pdf(doc);
    return await asPdf.toBlob();
  } catch (error) {
    console.error('Erro ao gerar PDF blob:', error);
    throw error;
  }
}