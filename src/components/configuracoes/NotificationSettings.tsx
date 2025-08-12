import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";

interface NotificationPreferences {
  mandato_alerts: boolean;
  reuniao_notifications: boolean;
  email_convocacoes: boolean;
  whatsapp_notifications: boolean;
  system_updates: boolean;
  weekly_digest: boolean;
}

interface NotificationSettingsProps {
  children: React.ReactNode;
}

export function NotificationSettings({ children }: NotificationSettingsProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mandato_alerts: true,
    reuniao_notifications: true,
    email_convocacoes: true,
    whatsapp_notifications: false,
    system_updates: true,
    weekly_digest: false,
  });

  // Load current preferences when dialog opens
  useEffect(() => {
    if (open && user) {
      loadPreferences();
    }
  }, [open, user]); // loadPreferences doesn't need to be in deps as it's stable

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user?.id)
        .single();

      if (error) {
        // If column doesn't exist, just use default preferences
        if (error.code === '42703' || error.message?.includes('column')) {
          console.warn('notification_preferences column not found, using defaults');
          // Keep default preferences
        } else {
          console.error('Error loading notification preferences:', error);
          toast.error('Erro ao carregar configurações de notificação');
        }
        return;
      }

      if (data?.notification_preferences) {
        setPreferences({
          ...preferences,
          ...data.notification_preferences,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Don't show error to user, just use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: preferences,
        })
        .eq('id', user.id);

      if (error) {
        // If column doesn't exist, show informative message
        if (error.code === '42703' || error.message?.includes('column')) {
          console.warn('notification_preferences column not found');
          toast.info('As configurações de notificação ainda não estão disponíveis. Entre em contato com o administrador.');
        } else {
          console.error('Error saving notification preferences:', error);
          toast.error('Erro ao salvar configurações de notificação');
        }
        return;
      }

      toast.success('Configurações de notificação atualizadas!');
      setOpen(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Erro inesperado ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </DialogTitle>
          <DialogDescription>
            Configure como deseja receber notificações do sistema CODEMA.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando configurações...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alertas de Mandato */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Alertas de Mandato</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="mandato-alerts">Alertas de expiração de mandato</Label>
                  <p className="text-xs text-muted-foreground">
                    Receber alertas 30, 15 e 7 dias antes da expiração
                  </p>
                </div>
                <Switch
                  id="mandato-alerts"
                  checked={preferences.mandato_alerts}
                  onCheckedChange={(value) => handlePreferenceChange('mandato_alerts', value)}
                />
              </div>
            </div>

            <Separator />

            {/* Notificações de Reunião */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Reuniões</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="reuniao-notifications">Notificações de reunião</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber alertas sobre reuniões agendadas e alterações
                    </p>
                  </div>
                  <Switch
                    id="reuniao-notifications"
                    checked={preferences.reuniao_notifications}
                    onCheckedChange={(value) => handlePreferenceChange('reuniao_notifications', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-convocacoes">Convocações por email</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber convocações oficiais por email
                    </p>
                  </div>
                  <Switch
                    id="email-convocacoes"
                    checked={preferences.email_convocacoes}
                    onCheckedChange={(value) => handlePreferenceChange('email_convocacoes', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="whatsapp-notifications">Notificações WhatsApp</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber lembretes por WhatsApp (experimental)
                    </p>
                  </div>
                  <Switch
                    id="whatsapp-notifications"
                    checked={preferences.whatsapp_notifications}
                    onCheckedChange={(value) => handlePreferenceChange('whatsapp_notifications', value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Sistema */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Sistema</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="system-updates">Atualizações do sistema</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber notificações sobre novas funcionalidades
                    </p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={preferences.system_updates}
                    onCheckedChange={(value) => handlePreferenceChange('system_updates', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="weekly-digest">Resumo semanal</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber resumo das atividades da semana
                    </p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={preferences.weekly_digest}
                    onCheckedChange={(value) => handlePreferenceChange('weekly_digest', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={savePreferences}
            disabled={isSaving || isLoading}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}