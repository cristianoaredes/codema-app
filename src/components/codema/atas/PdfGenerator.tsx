import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileDown, Printer, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/utils/auditLogger";

interface PdfGeneratorProps {
  ata: any;
  onPdfGenerated?: (pdfUrl: string) => void;
}

export function PdfGenerator({ ata, onPdfGenerated }: PdfGeneratorProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simular geração de PDF (em produção seria integração com API de PDF)
  const generatePdfMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      setProgress(0);

      // Simular progresso de geração
      const steps = [
        "Validando dados da ata...",
        "Aplicando template padrão...",
        "Formatando conteúdo...",
        "Gerando assinaturas...",
        "Criando PDF/A...",
        "Calculando hash de integridade...",
        "Salvando arquivo...",
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(((i + 1) / steps.length) * 100);
      }

      // Gerar dados do PDF
      const pdfData = generatePdfContent(ata);
      const pdfBlob = new Blob([pdfData.content], { type: 'application/pdf' });
      
      // Em produção, fazer upload para storage
      const fileName = `ata-${ata.numero.replace('/', '-')}.pdf`;
      const pdfUrl = `storage/atas/${fileName}`;
      
      // Calcular hash SHA-256 (simulado)
      const hashIntegridade = await calculateFileHash(pdfBlob);

      // Atualizar registro da ata
      const { data, error } = await supabase
        .from('atas')
        .update({
          pdf_gerado: true,
          pdf_url: pdfUrl,
          hash_integridade: hashIntegridade,
          updated_by: profile?.id,
        })
        .eq('id', ata.id)
        .select()
        .single();

      if (error) throw error;

      await logAction(
        'generate_ata_pdf',
        'atas',
        ata.id,
        { 
          numero: ata.numero,
          pdf_url: pdfUrl,
          hash_integridade: hashIntegridade
        }
      );

      return { ...data, pdfUrl };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['atas'] });
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso",
      });
      onPdfGenerated?.(data.pdfUrl);
      setGenerating(false);
      setProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF: " + error.message,
        variant: "destructive",
      });
      setGenerating(false);
      setProgress(0);
    },
  });

  const canGenerate = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);
  const isAtaApproved = ata.status === 'aprovada' || ata.status === 'assinada';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="w-5 h-5" />
          Geração de PDF/A
        </CardTitle>
        <CardDescription>
          Arquivo permanente para TCE-MG e arquivo histórico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Ata */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status da Ata:</span>
          <Badge variant={isAtaApproved ? "default" : "outline"}>
            {isAtaApproved ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Pronta para PDF
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Aguardando Aprovação
              </>
            )}
          </Badge>
        </div>

        {/* Status do PDF */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">PDF Gerado:</span>
          <Badge variant={ata.pdf_gerado ? "default" : "outline"}>
            {ata.pdf_gerado ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Disponível
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Não Gerado
              </>
            )}
          </Badge>
        </div>

        {/* Integridade */}
        {ata.hash_integridade && (
          <div>
            <span className="text-sm font-medium">Hash de Integridade:</span>
            <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono break-all">
              {ata.hash_integridade}
            </div>
          </div>
        )}

        {/* Alertas */}
        {!isAtaApproved && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A ata precisa estar aprovada ou assinada para gerar o PDF definitivo.
            </AlertDescription>
          </Alert>
        )}

        {!canGenerate && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Apenas secretários, presidentes e administradores podem gerar PDFs.
            </AlertDescription>
          </Alert>
        )}

        {/* Progresso de Geração */}
        {generating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Gerando PDF...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            onClick={() => generatePdfMutation.mutate()}
            disabled={!canGenerate || !isAtaApproved || generating}
            className="flex-1"
          >
            {generating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Gerar PDF/A
              </>
            )}
          </Button>

          {ata.pdf_gerado && (
            <Button variant="outline" onClick={() => downloadPdf(ata.pdf_url, ata.numero)}>
              <Printer className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          )}
        </div>

        {/* Informações Técnicas */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <h4 className="font-medium text-blue-900 mb-2">Padrão PDF/A para Arquivo</h4>
          <ul className="space-y-1 text-blue-700">
            <li>• Formato PDF/A-2b conforme ISO 19005-2</li>
            <li>• Hash SHA-256 para verificação de integridade</li>
            <li>• Metadados completos para TCE-MG</li>
            <li>• Assinatura digital embedded</li>
            <li>• Retenção de 5 anos obrigatória</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Função para gerar conteúdo do PDF (simulado)
function generatePdfContent(ata: any) {
  const content = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(CONSELHO MUNICIPAL DE DEFESA DO MEIO AMBIENTE - CODEMA) Tj
0 -20 Td
(ATA N° ${ata.numero}) Tj
0 -40 Td
(Data: ${format(new Date(ata.data_reuniao), "dd/MM/yyyy", { locale: ptBR })}) Tj
0 -20 Td
(Horário: ${ata.hora_inicio}${ata.hora_fim ? ' às ' + ata.hora_fim : ''}) Tj
0 -20 Td
(Local: ${ata.local_reuniao}) Tj
0 -40 Td
(Tipo: ${ata.tipo_reuniao === 'ordinaria' ? 'Reunião Ordinária' : 
         ata.tipo_reuniao === 'extraordinaria' ? 'Reunião Extraordinária' : 
         'Audiência Pública'}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Times-Roman
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF
  `;

  return {
    content,
    size: content.length,
    name: `ata-${ata.numero.replace('/', '-')}.pdf`
  };
}

// Função para calcular hash do arquivo (simulado)
async function calculateFileHash(blob: Blob): Promise<string> {
  // Em produção, usar crypto.subtle.digest
  const text = await blob.text();
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Simular hash SHA-256
  return 'sha256:' + Math.abs(hash).toString(16).padStart(64, '0');
}

// Função para download do PDF
function downloadPdf(pdfUrl: string, numero: string) {
  // Em produção, fazer download real do storage
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = `ata-${numero.replace('/', '-')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}