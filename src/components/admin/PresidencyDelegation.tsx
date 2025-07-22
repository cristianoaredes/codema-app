import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, UserCheck, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

interface PresidencyDelegationProps {
  vicePresidents: Profile[];
  onDelegationChange: () => void;
}

export const PresidencyDelegation: React.FC<PresidencyDelegationProps> = ({
  vicePresidents,
  onDelegationChange
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVice, setSelectedVice] = useState<Profile | null>(null);
  const [expirationDate, setExpirationDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Apenas presidentes podem usar este componente
  if (profile?.role !== 'presidente') {
    return null;
  }

  const handleDelegatePresidency = async () => {
    if (!selectedVice) return;

    setIsLoading(true);
    try {
      const expiresAt = expirationDate ? new Date(expirationDate).toISOString() : null;
      
      const { data, error } = await supabase
        .rpc('delegate_presidency_to_vice' as any, {
          vice_president_id: selectedVice.id,
          expires_at: expiresAt
        });

      if (error) throw error;

      if ((data as any)?.success) {
        toast({
          title: 'Presidência delegada',
          description: `${selectedVice.full_name} agora está atuando como presidente${expirationDate ? ` até ${new Date(expirationDate).toLocaleDateString()}` : ''}.`,
        });
        
        setIsDialogOpen(false);
        setSelectedVice(null);
        setExpirationDate('');
        onDelegationChange();
      } else {
        throw new Error((data as any)?.error || 'Erro ao delegar presidência');
      }
    } catch (error) {
      console.error('Erro ao delegar presidência:', error);
      toast({
        title: 'Erro ao delegar presidência',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeDelegation = async (vicePresident: Profile) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('revoke_presidency_delegation' as any, {
          vice_president_id: vicePresident.id
        });

      if (error) throw error;

      if ((data as any)?.success) {
        toast({
          title: 'Delegação revogada',
          description: `A delegação de presidência para ${vicePresident.full_name} foi revogada.`,
        });
        
        onDelegationChange();
      } else {
        throw new Error((data as any)?.error || 'Erro ao revogar delegação');
      }
    } catch (error) {
      console.error('Erro ao revogar delegação:', error);
      toast({
        title: 'Erro ao revogar delegação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activeVicePresident = vicePresidents.find(vp => vp.is_acting_president);
  const availableVicePresidents = vicePresidents.filter(vp => !vp.is_acting_president);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Delegação de Presidência
        </CardTitle>
        <CardDescription>
          Gerencie a delegação de poderes presidenciais aos vice-presidentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vice-presidente atualmente atuando */}
        {activeVicePresident && (
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{activeVicePresident.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Atuando como Presidente
                  </p>
                  {activeVicePresident.delegation_expires_at && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expira em {new Date(activeVicePresident.delegation_expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Ativo</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeDelegation(activeVicePresident)}
                  disabled={isLoading}
                >
                  Revogar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de vice-presidentes disponíveis */}
        {availableVicePresidents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Vice-presidentes disponíveis
            </h4>
            {availableVicePresidents.map((vp) => (
              <div key={vp.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{vp.full_name}</p>
                      <p className="text-sm text-muted-foreground">Vice-presidente</p>
                    </div>
                  </div>
                  <Dialog open={isDialogOpen && selectedVice?.id === vp.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (open) setSelectedVice(vp);
                    else setSelectedVice(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Delegar Presidência
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delegar Presidência</DialogTitle>
                        <DialogDescription>
                          Você está prestes a delegar seus poderes presidenciais para {vp.full_name}.
                          Durante a delegação, ele terá todas as permissões de presidente.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div className="text-sm text-amber-800">
                              <p className="font-medium">Atenção:</p>
                              <p>O vice-presidente terá acesso total às funcionalidades administrativas durante a delegação.</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expiration">Data de expiração (opcional)</Label>
                          <Input
                            id="expiration"
                            type="datetime-local"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Se não especificada, a delegação ficará ativa até ser revogada manualmente.
                          </p>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleDelegatePresidency}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Delegando...' : 'Confirmar Delegação'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Caso não haja vice-presidentes */}
        {vicePresidents.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum vice-presidente cadastrado</p>
            <p className="text-sm">Cadastre vice-presidentes para habilitar a delegação</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 