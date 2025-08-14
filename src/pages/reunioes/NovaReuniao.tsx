import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { SmartForm, SmartInput, SmartTextarea, AutoSaveConfig } from "@/components/forms/SmartForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,

} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreadcrumbWithActions, SmartBreadcrumb } from "@/components/navigation/SmartBreadcrumb";
import { ArrowLeft, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { NotificationConfigPanel, NotificationConfig } from "@/components/notifications/NotificationConfigPanel";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";
import { NotificationService } from "@/services/notificationService";

const reuniaoSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  data_hora: z.string().min(1, "Data e hora são obrigatórias"),
  local: z.string().min(3, "Local deve ter pelo menos 3 caracteres"),
  tipo: z.enum(["ordinaria", "extraordinaria", "publica"]),
  status: z.enum(["agendada", "realizada", "cancelada"]).default("agendada"),
  pauta: z.string().optional(),
});

type ReuniaoFormData = z.infer<typeof reuniaoSchema>;

export default function NovaReuniao() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { scheduleConvocacao, isScheduling } = useNotificationScheduler();

  // Estado para configurações de notificação
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    enabled: true,
    antecedencia_dias: 3,
    lembrete_24h: true,
    lembrete_2h: true,
    incluir_pauta: true,
    incluir_documentos: false,
    canais: {
      email: true,
      sms: true,
      whatsapp: false
    },
    destinatarios: []
  });

  const defaultValues: ReuniaoFormData = {
    titulo: "",
    descricao: "",
    data_hora: "",
    local: "",
    tipo: "ordinaria",
    status: "agendada",
    pauta: "",
  };

  const autoSaveConfig: AutoSaveConfig = {
    enabled: true,
    interval: 3000,
    key: "nova-reuniao-form",
    onError: (error) => {
      console.error("Auto-save error:", error);
    },
  };

  const handleSubmit = async (data: ReuniaoFormData) => {
    if (!profile?.id) {
      throw new Error("Usuário não autenticado");
    }

    // Map form data to database schema
    const reuniaoData = {
      titulo: data.titulo,
      tipo: data.tipo,
      data_reuniao: data.data_hora, // Map data_hora to data_reuniao
      local: data.local,
      status: data.status,
      secretario_id: profile.id,
      pauta: data.pauta || null,
      ata: null,
      protocolo: null,
      protocolo_ata: null,
      protocolo_convocacao: null,
    };

    const { data: reuniaoCriada, error } = await supabase.from("reunioes").insert(reuniaoData).select().single();

    if (error) throw error;

    // Agendar notificações se configurado
    if (notificationConfig.enabled && reuniaoCriada) {
      try {
        // Buscar conselheiros ativos para notificação
        const { data: conselheiros } = await supabase
          .from('conselheiros')
          .select('id, nome, email, telefone, cargo')
          .eq('status', 'ativo');

        if (conselheiros && conselheiros.length > 0) {
          const convocacaoData = {
            reuniao: {
              id: reuniaoCriada.id,
              titulo: reuniaoCriada.titulo,
              data_reuniao: reuniaoCriada.data_reuniao,
              local: reuniaoCriada.local,
              tipo: reuniaoCriada.tipo,
              protocolo: reuniaoCriada.protocolo || 'Pendente',
              observacoes: data.descricao,
              pauta: data.pauta ? [{ 
                id: '1', 
                titulo: 'Pauta da Reunião', 
                descricao: data.pauta,
                ordem: 1 
              }] : []
            },
            conselheiros: conselheiros.map(c => ({
              id: c.id,
              name: c.nome,
              email: c.email,
              phone: c.telefone,
              role: c.cargo,
              preferences: {
                email: notificationConfig.canais.email,
                sms: notificationConfig.canais.sms,
                whatsapp: notificationConfig.canais.whatsapp
              }
            })),
            configuracao: {
              antecedencia_dias: notificationConfig.antecedencia_dias,
              lembrete_24h: notificationConfig.lembrete_24h,
              lembrete_2h: notificationConfig.lembrete_2h,
              incluir_pauta: notificationConfig.incluir_pauta,
              incluir_documentos: notificationConfig.incluir_documentos
            }
          };

          scheduleConvocacao(convocacaoData);
        }
      } catch (notificationError) {
        console.error('Erro ao agendar notificações:', notificationError);
        toast({
          title: "Reunião criada",
          description: "Reunião criada com sucesso, mas houve erro ao agendar notificações.",
          variant: "destructive",
        });
      }
    }

    toast({
      title: "Sucesso",
      description: notificationConfig.enabled 
        ? "Reunião criada e notificações agendadas com sucesso!" 
        : "Reunião criada com sucesso!",
    });

    navigate("/reunioes");
  };

  const handleCancel = () => {
    navigate("/reunioes");
  };

  return (
    <div className="space-y-6">
      <BreadcrumbWithActions
        title="Nova Reunião"
        description="Agende uma nova reunião do CODEMA"
        actions={
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        }
      >
        <SmartBreadcrumb />
      </BreadcrumbWithActions>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Informações da Reunião
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartForm
            schema={reuniaoSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            autoSave={autoSaveConfig}
            submitButton={{
              text: "Criar Reunião",
              loadingText: "Criando...",
            }}
            realTimeValidation={true}
            showSaveStatus={true}
          >
            {(form) => (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SmartInput
                    form={form}
                    name="titulo"
                    label="Título da Reunião"
                    placeholder="Ex: Reunião Ordinária - Janeiro 2025"
                    required={true}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Reunião</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ordinaria">Ordinária</SelectItem>
                            <SelectItem value="extraordinaria">Extraordinária</SelectItem>
                            <SelectItem value="publica">Pública</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <SmartInput
                    form={form}
                    name="data_hora"
                    label="Data e Hora"
                    type="datetime-local"
                    description="Selecione a data e horário da reunião"
                    required={true}
                  />

                  <SmartInput
                    form={form}
                    name="local"
                    label="Local da Reunião"
                    placeholder="Ex: Câmara Municipal de Itanhomi"
                    required={true}
                  />
                </div>

                <SmartTextarea
                  form={form}
                  name="descricao"
                  label="Descrição (Opcional)"
                  placeholder="Descreva a pauta ou objetivos da reunião..."
                  description="Informações adicionais sobre a reunião"
                  className="min-h-[100px]"
                />

                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </SmartForm>
        </CardContent>
      </Card>

      {/* Painel de Configuração de Notificações */}
      <NotificationConfigPanel
        config={notificationConfig}
        onChange={setNotificationConfig}
        reunionData={{
          data_reuniao: '', // Será preenchido dinamicamente pelo formulário
          tipo: 'ordinaria'
        }}
      />
    </div>
  );
}