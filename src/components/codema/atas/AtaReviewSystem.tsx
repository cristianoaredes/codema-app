import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Send, Check, X, Clock, User, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/utils/auditLogger";

interface AtaReviewSystemProps {
  ataId: string;
  canReview: boolean;
}

interface Review {
  id: string;
  secao: string;
  comentario: string;
  sugestao_alteracao: string;
  linha_referencia: number;
  status: string;
  resposta: string;
  created_at: string;
  revisor_id: string;
  respondido_por: string;
  respondido_em: string;
  profiles: {
    full_name: string;
    role: string;
  };
  resposta_profiles?: {
    full_name: string;
  };
}

const SECOES = [
  { value: 'pauta', label: 'Pauta' },
  { value: 'presentes', label: 'Lista de Presença' },
  { value: 'deliberacoes', label: 'Deliberações' },
  { value: 'observacoes', label: 'Observações' },
  { value: 'geral', label: 'Aspectos Gerais' },
];

export function AtaReviewSystem({ ataId, canReview }: AtaReviewSystemProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showNewReview, setShowNewReview] = useState(false);
  const [newReview, setNewReview] = useState({
    secao: '',
    comentario: '',
    sugestao_alteracao: '',
    linha_referencia: 1,
  });

  // Buscar revisões da ata
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['ata-reviews', ataId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atas_revisoes')
        .select(`
          *,
          profiles:revisor_id(full_name, role),
          resposta_profiles:respondido_por(full_name)
        `)
        .eq('ata_id', ataId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  // Criar nova revisão
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: typeof newReview) => {
      const { data, error } = await supabase
        .from('atas_revisoes')
        .insert({
          ata_id: ataId,
          revisor_id: profile?.id,
          ...reviewData,
        })
        .select(`
          *,
          profiles:revisor_id(full_name, role)
        `)
        .single();

      if (error) throw error;

      await logAction(
        'create_ata_review',
        'atas_revisoes',
        data.id,
        { ata_id: ataId, secao: reviewData.secao }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ata-reviews', ataId] });
      toast({
        title: "Sucesso",
        description: "Revisão adicionada com sucesso",
      });
      setNewReview({
        secao: '',
        comentario: '',
        sugestao_alteracao: '',
        linha_referencia: 1,
      });
      setShowNewReview(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar revisão: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Responder à revisão
  const respondReviewMutation = useMutation({
    mutationFn: async ({ reviewId, resposta, status }: { reviewId: string; resposta: string; status: string }) => {
      const { data, error } = await supabase
        .from('atas_revisoes')
        .update({
          status,
          resposta,
          respondido_por: profile?.id,
          respondido_em: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;

      await logAction(
        'respond_ata_review',
        'atas_revisoes',
        reviewId,
        { status, resposta_length: resposta.length }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ata-reviews', ataId] });
      toast({
        title: "Sucesso",
        description: "Resposta enviada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao responder revisão: " + error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'aceita':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><Check className="w-3 h-3 mr-1" />Aceita</Badge>;
      case 'rejeitada':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><X className="w-3 h-3 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getSecaoLabel = (secao: string) => {
    const secaoObj = SECOES.find(s => s.value === secao);
    return secaoObj?.label || secao;
  };

  const canRespond = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);

  const handleSubmitReview = () => {
    if (!newReview.secao || !newReview.comentario) {
      toast({
        title: "Erro",
        description: "Seção e comentário são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate(newReview);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Sistema de Revisão</h3>
          <p className="text-sm text-muted-foreground">
            Colaboração e feedback para melhoria da ata
          </p>
        </div>

        {canReview && (
          <Dialog open={showNewReview} onOpenChange={setShowNewReview}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" />
                Nova Revisão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Revisão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Seção</Label>
                  <Select value={newReview.secao} onValueChange={(value) => setNewReview({ ...newReview, secao: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a seção" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECOES.map((secao) => (
                        <SelectItem key={secao.value} value={secao.value}>
                          {secao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Linha/Item de Referência (Opcional)</Label>
                  <input
                    type="number"
                    min="1"
                    value={newReview.linha_referencia}
                    onChange={(e) => setNewReview({ ...newReview, linha_referencia: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <Label>Comentário *</Label>
                  <Textarea
                    value={newReview.comentario}
                    onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
                    placeholder="Descreva sua observação ou questionamento..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Sugestão de Alteração (Opcional)</Label>
                  <Textarea
                    value={newReview.sugestao_alteracao}
                    onChange={(e) => setNewReview({ ...newReview, sugestao_alteracao: e.target.value })}
                    placeholder="Proposta de texto alternativo..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewReview(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={createReviewMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createReviewMutation.isPending ? "Enviando..." : "Enviar Revisão"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reviews.filter(r => r.status === 'pendente').length}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reviews.filter(r => r.status === 'aceita').length}</div>
            <p className="text-xs text-muted-foreground">Aceitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reviews.filter(r => r.status === 'rejeitada').length}</div>
            <p className="text-xs text-muted-foreground">Rejeitadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{getSecaoLabel(review.secao)}</Badge>
                    {review.linha_referencia > 1 && (
                      <Badge variant="outline">Linha {review.linha_referencia}</Badge>
                    )}
                    {getStatusBadge(review.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {review.profiles?.full_name}
                    <span>•</span>
                    {format(new Date(review.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Comentário</h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                  {review.comentario}
                </p>
              </div>

              {review.sugestao_alteracao && (
                <div>
                  <h4 className="font-medium mb-2">Sugestão de Alteração</h4>
                  <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-md">
                    {review.sugestao_alteracao}
                  </p>
                </div>
              )}

              {review.resposta && (
                <div>
                  <h4 className="font-medium mb-2">Resposta</h4>
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-700 mb-2">{review.resposta}</p>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <User className="w-3 h-3" />
                      {review.resposta_profiles?.full_name}
                      <span>•</span>
                      {review.respondido_em && format(new Date(review.respondido_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              )}

              {canRespond && review.status === 'pendente' && !review.resposta && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Responder Revisão</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ReviewResponse
                      reviewId={review.id}
                      onSubmit={(resposta, status) => respondReviewMutation.mutate({ reviewId: review.id, resposta, status })}
                      isLoading={respondReviewMutation.isPending}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <MessageSquare className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500">Nenhuma revisão encontrada</p>
            {canReview && (
              <p className="text-sm text-gray-400">Seja o primeiro a adicionar uma revisão</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ReviewResponseProps {
  reviewId: string;
  onSubmit: (resposta: string, status: string) => void;
  isLoading: boolean;
}

function ReviewResponse({ reviewId, onSubmit, isLoading }: ReviewResponseProps) {
  const [resposta, setResposta] = useState('');
  const [status, setStatus] = useState<'aceita' | 'rejeitada'>('aceita');

  const handleSubmit = () => {
    if (!resposta.trim()) return;
    onSubmit(resposta, status);
    setResposta('');
  };

  return (
    <div className="space-y-3 col-span-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={status === 'aceita' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus('aceita')}
        >
          <Check className="w-4 h-4 mr-1" />
          Aceitar
        </Button>
        <Button
          type="button"
          variant={status === 'rejeitada' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => setStatus('rejeitada')}
        >
          <X className="w-4 h-4 mr-1" />
          Rejeitar
        </Button>
      </div>

      <Textarea
        value={resposta}
        onChange={(e) => setResposta(e.target.value)}
        placeholder={`${status === 'aceita' ? 'Agradeça' : 'Explique o motivo da rejeição'} e detalhe sua resposta...`}
        className="min-h-[80px]"
      />

      <Button 
        onClick={handleSubmit}
        disabled={!resposta.trim() || isLoading}
        size="sm"
      >
        <Send className="w-4 h-4 mr-2" />
        {isLoading ? "Enviando..." : `${status === 'aceita' ? 'Aceitar' : 'Rejeitar'} Revisão`}
      </Button>
    </div>
  );
}