import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Registrar fontes para melhor aparência
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
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #000',
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 5,
  },
  ataNumber: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    marginRight: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  column: {
    flex: 1,
  },
  listItem: {
    fontSize: 11,
    marginLeft: 20,
    marginBottom: 5,
  },
  signatures: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signatureBlock: {
    alignItems: 'center',
    width: 200,
  },
  signatureLine: {
    borderTop: '1 solid #000',
    width: '100%',
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 10,
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 9,
    textAlign: 'center',
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 9,
    color: '#666',
  },
  deliberation: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 10,
    borderLeft: '3 solid #2563eb',
  },
  deliberationTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 5,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e0e0e0',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 700,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    padding: 5,
  },
});

interface AtaData {
  id?: string;
  numero: string;
  data_reuniao: string;
  hora_inicio: string;
  hora_fim?: string;
  local_reuniao: string;
  tipo_reuniao: string;
  pauta?: any[];
  presentes?: any[];
  ausentes?: any[];
  deliberacoes?: any[];
  observacoes?: string;
  assinatura_presidente?: string;
  assinatura_secretario?: string;
  data_assinatura_presidente?: string;
  data_assinatura_secretario?: string;
}

interface PdfGeneratorProps {
  ata: AtaData;
  onPdfGenerated?: () => void;
}

// Componente do documento PDF
const AtaPdfDocument: React.FC<{ ata: AtaData }> = ({ ata }) => {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return date;
    }
  };

  const getTipoReuniao = (tipo: string) => {
    const tipos: Record<string, string> = {
      ordinaria: 'Ordinária',
      extraordinaria: 'Extraordinária',
      publica: 'Pública',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CONSELHO MUNICIPAL DE DEFESA DO MEIO AMBIENTE</Text>
          <Text style={styles.subtitle}>CODEMA - Itanhomi/MG</Text>
          <Text style={styles.subtitle}>CNPJ: 00.000.000/0001-00</Text>
          <Text style={styles.ataNumber}>ATA {ata.numero}</Text>
        </View>

        {/* Informações da Reunião */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES DA REUNIÃO</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.text}>
                <Text style={styles.label}>Data:</Text>
                {formatDate(ata.data_reuniao)}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Horário:</Text>
                {ata.hora_inicio} às {ata.hora_fim || '___:___'}
              </Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.text}>
                <Text style={styles.label}>Tipo:</Text>
                Reunião {getTipoReuniao(ata.tipo_reuniao)}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Local:</Text>
                {ata.local_reuniao}
              </Text>
            </View>
          </View>
        </View>

        {/* Presentes */}
        {ata.presentes && ata.presentes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONSELHEIROS PRESENTES</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Nome</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>Entidade</Text>
                <Text style={styles.tableCell}>Segmento</Text>
              </View>
              {ata.presentes.map((presente: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{presente.nome}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{presente.entidade || '-'}</Text>
                  <Text style={styles.tableCell}>{presente.segmento || '-'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Ausentes */}
        {ata.ausentes && ata.ausentes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONSELHEIROS AUSENTES</Text>
            {ata.ausentes.map((ausente: any, index: number) => (
              <Text key={index} style={styles.listItem}>
                • {ausente.nome} - {ausente.justificativa ? `Justificado: ${ausente.justificativa}` : 'Sem justificativa'}
              </Text>
            ))}
          </View>
        )}

        {/* Pauta */}
        {ata.pauta && ata.pauta.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PAUTA DA REUNIÃO</Text>
            {ata.pauta.map((item: any, index: number) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {item.titulo || item.descricao || item}
              </Text>
            ))}
          </View>
        )}

        {/* Deliberações */}
        {ata.deliberacoes && ata.deliberacoes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DELIBERAÇÕES</Text>
            {ata.deliberacoes.map((deliberacao: any, index: number) => (
              <View key={index} style={styles.deliberation}>
                <Text style={styles.deliberationTitle}>
                  Deliberação {index + 1}: {deliberacao.titulo || deliberacao.assunto}
                </Text>
                <Text style={styles.text}>{deliberacao.descricao || deliberacao.decisao}</Text>
                {deliberacao.votacao && (
                  <Text style={styles.text}>
                    <Text style={styles.label}>Votação:</Text>
                    Favoráveis: {deliberacao.votacao.favoraveis || 0} | 
                    Contrários: {deliberacao.votacao.contrarios || 0} | 
                    Abstenções: {deliberacao.votacao.abstencoes || 0}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Observações */}
        {ata.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVAÇÕES</Text>
            <Text style={styles.text}>{ata.observacoes}</Text>
          </View>
        )}

        {/* Assinaturas */}
        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Presidente do CODEMA</Text>
            {ata.data_assinatura_presidente && (
              <Text style={styles.signatureRole}>
                Assinado em {formatDate(ata.data_assinatura_presidente)}
              </Text>
            )}
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Secretário(a) Executivo(a)</Text>
            {ata.data_assinatura_secretario && (
              <Text style={styles.signatureRole}>
                Assinado em {formatDate(ata.data_assinatura_secretario)}
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Conselho Municipal de Defesa do Meio Ambiente - CODEMA Itanhomi/MG
        </Text>
        <Text style={styles.pageNumber}>
          Página 1
        </Text>
      </Page>
    </Document>
  );
};

const PdfGenerator: React.FC<PdfGeneratorProps> = ({ ata, onPdfGenerated }) => {
  if (!ata) {
    return (
      <Button disabled variant="outline">
        <FileText className="mr-2 h-4 w-4" />
        Selecione uma ata
      </Button>
    );
  }

  const fileName = `ATA_${ata.numero.replace('/', '_')}_${format(new Date(), 'ddMMyyyy')}.pdf`;

  return (
    <PDFDownloadLink
      document={<AtaPdfDocument ata={ata} />}
      fileName={fileName}
      onClick={onPdfGenerated}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <>
              <FileText className="mr-2 h-4 w-4 animate-pulse" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default PdfGenerator;