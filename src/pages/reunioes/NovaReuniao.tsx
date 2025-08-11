import React from "react";
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

    const { error } = await supabase.from("reunioes").insert(reuniaoData);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Reunião criada com sucesso!",
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
    </div>
  );
}