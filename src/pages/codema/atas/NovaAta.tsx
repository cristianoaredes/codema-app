import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { useReunioes } from '@/hooks/useReunioes';
import { useAtas, useCreateAta } from '@/hooks/useAtas';

export default function NovaAta() {
  const navigate = useNavigate();
  const { data: reunioes = [] } = useReunioes();
  const createAta = useCreateAta();
  
  const [formData, setFormData] = useState({
    reuniao_id: '',
    tipo_reuniao: 'ordinaria',
    data_reuniao: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    hora_fim: '',
    local_reuniao: '',
    pauta: '',
    deliberacoes: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reuniao_id || !formData.hora_inicio || !formData.local_reuniao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createAta.mutateAsync({
        ...formData,
        pauta: formData.pauta.split('\n').filter(item => item.trim()),
        deliberacoes: formData.deliberacoes.split('\n').filter(item => item.trim()),
        presentes: [],
        ausentes: [],
        status: 'rascunho'
      });
      
      toast.success('Ata criada com sucesso!');
      navigate('/codema/atas');
    } catch (error) {
      console.error('Erro ao criar ata:', error);
      toast.error('Erro ao criar ata');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/codema/atas')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Nova Ata
            </h1>
            <p className="text-muted-foreground">
              Crie uma nova ata de reunião do CODEMA
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Ata</CardTitle>
          <CardDescription>
            Preencha os dados da reunião para gerar a ata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reunião */}
              <div className="space-y-2">
                <Label htmlFor="reuniao">Reunião *</Label>
                <Select
                  value={formData.reuniao_id}
                  onValueChange={(value) => setFormData({...formData, reuniao_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a reunião" />
                  </SelectTrigger>
                  <SelectContent>
                    {reunioes.map((reuniao) => (
                      <SelectItem key={reuniao.id} value={reuniao.id}>
                        {reuniao.titulo} - {new Date(reuniao.data_reuniao).toLocaleDateString('pt-BR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Reunião */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Reunião *</Label>
                <Select
                  value={formData.tipo_reuniao}
                  onValueChange={(value) => setFormData({...formData, tipo_reuniao: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordinaria">Ordinária</SelectItem>
                    <SelectItem value="extraordinaria">Extraordinária</SelectItem>
                    <SelectItem value="especial">Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="data">Data da Reunião *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data_reuniao}
                  onChange={(e) => setFormData({...formData, data_reuniao: e.target.value})}
                  required
                />
              </div>

              {/* Horários */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora Início *</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_fim">Hora Fim</Label>
                  <Input
                    id="hora_fim"
                    type="time"
                    value={formData.hora_fim}
                    onChange={(e) => setFormData({...formData, hora_fim: e.target.value})}
                  />
                </div>
              </div>

              {/* Local */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="local">Local da Reunião *</Label>
                <Input
                  id="local"
                  value={formData.local_reuniao}
                  onChange={(e) => setFormData({...formData, local_reuniao: e.target.value})}
                  placeholder="Ex: Sala de Reuniões da Prefeitura"
                  required
                />
              </div>
            </div>

            {/* Pauta */}
            <div className="space-y-2">
              <Label htmlFor="pauta">Pauta (um item por linha)</Label>
              <Textarea
                id="pauta"
                value={formData.pauta}
                onChange={(e) => setFormData({...formData, pauta: e.target.value})}
                placeholder="Digite os itens da pauta, um por linha"
                className="min-h-[100px]"
              />
            </div>

            {/* Deliberações */}
            <div className="space-y-2">
              <Label htmlFor="deliberacoes">Deliberações (uma por linha)</Label>
              <Textarea
                id="deliberacoes"
                value={formData.deliberacoes}
                onChange={(e) => setFormData({...formData, deliberacoes: e.target.value})}
                placeholder="Digite as deliberações, uma por linha"
                className="min-h-[100px]"
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Observações adicionais"
                className="min-h-[80px]"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/codema/atas')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createAta.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createAta.isPending ? 'Salvando...' : 'Salvar Ata'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}