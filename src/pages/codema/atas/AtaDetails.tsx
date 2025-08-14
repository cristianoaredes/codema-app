import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  AlertCircle,
  Clock,
  FileText,
  CheckCircle,
  Edit,
  History,
  Download,
  Mail,
  FileSignature
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAproveAta } from "@/hooks/useAtas";
import { logAction } from "@/utils/monitoring";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
// generateAtaPDF will be imported dynamically for better code splitting

interface Ata {
  id: string;
  reuniao_id: string;
  numero_ata: string;
  conteudo: string;
  status: 'rascunho' | 'em_revisao' | 'aprovada' | 'publicada';
  versao: number;
  data_aprovacao: string | null;
  aprovada_por: string | null;
  pdf_url: string | null;
  hash_verificacao: string | null;
  created_at: string;
  updated_at: string;
  reuniao?: {
    numero_reuniao: string;
    tipo: string;
    data_hora: string;
    local: string;
    pauta: string;
  };
  aprovador?: {
    full_name: string;
  };
}

const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case 'rascunho':
      return 'outline';
    case 'em_revisao':
      return 'secondary';
    case 'aprovada':
      return 'default';
    case 'publicada':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'rascunho': 'Rascunho',
    'em_revisao': 'Em Revisão',
    'aprovada': 'Aprovada',
    'publicada': 'Publicada',
  };
  return statusMap[status] || status;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'rascunho':
      return <Edit className="h-3 w-3 mr-1" />;
    case 'em_revisao':
      return <Clock className="h-3 w-3 mr-1" />;
    case 'aprovada':
      return <CheckCircle className="h-3 w-3 mr-1" />;
    case 'publicada':
      return <FileText className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
};

export default function AtaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const approveMutation = useAproveAta();

  const { data: ata, isLoading, error } = useQuery({
    queryKey: ['ata', id],
    queryFn: async (): Promise<Ata> => {
      const { data, error } = await supabase
        .from('atas')
        .select(`
          *,
          reuniao:reunioes(*),
          aprovador:profiles!atas_aprovada_por_fkey(full_name)
        `)
        .eq('id', id!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar ata: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/codema/atas')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Atas
        </Button>
      </div>
    );
  }

  if (!ata) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ata não encontrada.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/codema/atas')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Atas
        </Button>
      </div>
    );
  }

  const canEdit = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);
  const canApprove = profile?.role && ['admin', 'presidente'].includes(profile.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/codema/atas')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Ata {ata.numero_ata}</h1>
            <Badge variant={getStatusVariant(ata.status)}>
              {getStatusIcon(ata.status)}
              {getStatusLabel(ata.status)}
            </Badge>
            <Badge variant="outline">
              v{ata.versao}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Ata #{ata.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Informações da Reunião */}
      {ata.reuniao && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reunião Relacionada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Número da Reunião</p>
                <p className="text-sm text-muted-foreground">{ata.reuniao.numero_reuniao}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tipo</p>
                <p className="text-sm text-muted-foreground">
                  {ata.reuniao.tipo === 'ordinaria' ? 'Ordinária' : 'Extraordinária'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Data e Hora</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(ata.reuniao.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Local</p>
                <p className="text-sm text-muted-foreground">{ata.reuniao.local}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações da Ata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações da Ata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Criada em: {format(new Date(ata.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Atualizada em: {format(new Date(ata.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            {ata.data_aprovacao && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Aprovada em: {format(new Date(ata.data_aprovacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}
            {ata.aprovador && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Aprovada por: {ata.aprovador.full_name}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da Ata */}
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo da Ata</CardTitle>
          <CardDescription>
            Texto completo da ata da reunião
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-foreground">
              {ata.conteudo}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      {(canEdit || canApprove) && (
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Gerenciar ata e status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {canEdit && ata.status === 'rascunho' && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/atas/editar/${ata.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Ata
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate(`/atas/historico/${ata.id}`)}
              >
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Button>

              {canApprove && ata.status === 'em_revisao' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await approveMutation.mutateAsync({ id: ata.id, aprovada_por: profile!.id });
                      await logAction('APPROVE', 'ata', ata.id, { numero: ata.numero_ata });
                    } catch (err: any) {
                      toast({
                        title: 'Erro ao aprovar',
                        description: err?.message || 'Tente novamente mais tarde',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
              )}

              {ata.status === 'aprovada' && (
                <>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const { generateAtaPDF } = await import('@/utils/pdfGenerator');
                        await generateAtaPDF(ata);
                        toast({
                          title: 'PDF gerado com sucesso',
                          description: 'O arquivo foi baixado para seu computador',
                        });
                        await logAction('EXPORT', 'ata', ata.id, { 
                          tipo: 'pdf',
                          numero: ata.numero_ata 
                        });
                      } catch (error: any) {
                        console.error('Erro ao gerar PDF:', error);
                        toast({
                          title: 'Erro ao gerar PDF',
                          description: error?.message || 'Tente novamente mais tarde',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        // Get all active conselheiros for email distribution
                        const { data: conselheiros } = await supabase
                          .from('conselheiros')
                          .select(`
                            profiles:profile_id (
                              email,
                              full_name
                            )
                          `)
                          .eq('status', 'ativo');

                        if (conselheiros && conselheiros.length > 0) {
                          // Send email to all conselheiros
                          for (const conselheiro of conselheiros) {
                            if (conselheiro.profiles?.email) {
                              await supabase
                                .from('email_queue')
                                .insert({
                                  to_email: conselheiro.profiles.email,
                                  subject: `Ata ${ata.numero_ata} - CODEMA Itanhomi`,
                                  html_content: `
                                    <div style="font-family: Arial, sans-serif;">
                                      <h2>Ata de Reunião - CODEMA</h2>
                                      <p>Prezado(a) ${conselheiro.profiles.full_name},</p>
                                      <p>Segue em anexo a ata da reunião ${ata.numero_ata}.</p>
                                      <p><strong>Reunião:</strong> ${ata.reuniao_titulo || 'N/A'}</p>
                                      <p><strong>Status:</strong> ${ata.status}</p>
                                      <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5;">
                                        <h3>Conteúdo da Ata:</h3>
                                        <div>${ata.conteudo}</div>
                                      </div>
                                      <p>Atenciosamente,<br/>Secretaria do CODEMA</p>
                                    </div>
                                  `,
                                  text_content: `Ata ${ata.numero_ata} - ${ata.reuniao_titulo}`,
                                  email_type: 'ata_distribution',
                                  scheduled_for: new Date().toISOString()
                                });
                            }
                          }
                          toast.success(`Ata enviada para ${conselheiros.length} conselheiros`);
                        }
                      } catch (error) {
                        console.error('Erro ao enviar ata:', error);
                        toast.error('Erro ao enviar ata por email');
                      }
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar por Email
                  </Button>
                </>
              )}

              {canEdit && ata.status === 'aprovada' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('atas')
                        .update({ 
                          status: 'publicada',
                          data_publicacao: new Date().toISOString()
                        })
                        .eq('id', ata.id);
                      
                      if (error) throw error;
                      
                      toast.success('Ata publicada com sucesso!');
                      // Refresh data
                      window.location.reload();
                    } catch (error) {
                      console.error('Erro ao publicar ata:', error);
                      toast.error('Erro ao publicar ata');
                    }
                  }}
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Publicar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verificação de Integridade */}
      {ata.hash_verificacao && (
        <Card>
          <CardHeader>
            <CardTitle>Verificação de Integridade</CardTitle>
            <CardDescription>
              Hash de verificação para garantir autenticidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-xs font-mono break-all">
                {ata.hash_verificacao}
              </code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}