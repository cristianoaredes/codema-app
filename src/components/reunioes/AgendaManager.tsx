import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Timer,
  User
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export interface AgendaItem {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  responsavel: string;
  status: 'pendente' | 'em_discussao' | 'votacao' | 'aprovado' | 'rejeitado' | 'adiado';
  tempoEstimado?: number; // em minutos
  tempoDecorrido?: number; // em minutos
  observacoes?: string;
  decisao?: string;
  votos?: {
    favoraveis: number;
    contrarios: number;
    abstencoes: number;
  };
  inicioDiscussao?: Date;
}

interface AgendaManagerProps {
  meetingId: string;
  items: AgendaItem[];
  currentItemIndex?: number;
  canEdit?: boolean;
  isInProgress?: boolean;
  onItemsChange?: (items: AgendaItem[]) => void;
  onCurrentItemChange?: (index: number) => void;
  onSaveAgenda?: (items: AgendaItem[]) => Promise<void>;
}

// Lazy load heavy components for better initial performance
const AgendaItemDialog = lazy(() => import('./AgendaItemDialog').catch(() => ({ default: () => null })));

export const AgendaManager = React.memo(function AgendaManager({
  meetingId,
  items: initialItems,
  currentItemIndex = -1,
  canEdit = false,
  isInProgress = false,
  onItemsChange,
  onCurrentItemChange,
  onSaveAgenda
}: AgendaManagerProps) {
  const { profile } = useAuth();
  const [items, setItems] = useState<AgendaItem[]>(initialItems);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Formulário para novo item
  const [newItem, setNewItem] = useState<Partial<AgendaItem>>({
    titulo: '',
    descricao: '',
    responsavel: '',
    tempoEstimado: 15,
    status: 'pendente'
  });

  // Timer para item atual
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Memoizar permissões do usuário
  const canManageAgenda = useMemo(() => 
    profile?.role === 'admin' || 
    profile?.role === 'presidente' || 
    profile?.role === 'secretario'
  , [profile?.role]);

  // Memoizar função de status para evitar recriações
  const getStatusInfo = useCallback((status: AgendaItem['status']) => {
    switch (status) {
      case 'pendente':
        return { label: 'Pendente', color: 'text-gray-600', variant: 'secondary' as const, icon: <Clock className="h-3 w-3" /> };
      case 'em_discussao':
        return { label: 'Em Discussão', color: 'text-blue-600', variant: 'default' as const, icon: <Timer className="h-3 w-3" /> };
      case 'votacao':
        return { label: 'Votação', color: 'text-yellow-600', variant: 'default' as const, icon: <AlertCircle className="h-3 w-3" /> };
      case 'aprovado':
        return { label: 'Aprovado', color: 'text-green-600', variant: 'default' as const, icon: <CheckCircle className="h-3 w-3" /> };
      case 'rejeitado':
        return { label: 'Rejeitado', color: 'text-red-600', variant: 'destructive' as const, icon: <X className="h-3 w-3" /> };
      case 'adiado':
        return { label: 'Adiado', color: 'text-orange-600', variant: 'secondary' as const, icon: <Clock className="h-3 w-3" /> };
    }
  }, []);

  const handleAddItem = useCallback(() => {
    if (!isFormValid) return;

    const item: AgendaItem = {
      id: Date.now().toString(),
      numero: items.length + 1,
      titulo: newItem.titulo,
      descricao: newItem.descricao,
      responsavel: newItem.responsavel,
      status: 'pendente',
      tempoEstimado: newItem.tempoEstimado || 15
    };

    const newItems = [...items, item];
    setItems(newItems);
    onItemsChange?.(newItems);
    
    // Reset form
    setNewItem({
      titulo: '',
      descricao: '',
      responsavel: '',
      tempoEstimado: 15,
      status: 'pendente'
    });
    setShowAddDialog(false);
  }, [items, newItem, onItemsChange, isFormValid]);

  const handleDeleteItem = useCallback((index: number) => {
    const newItems = items.filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, numero: i + 1 })); // Renumerar
    setItems(newItems);
    onItemsChange?.(newItems);
  }, [items, onItemsChange]);

  const handleMoveItem = useCallback((index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Renumerar
    newItems.forEach((item, i) => item.numero = i + 1);
    
    setItems(newItems);
    onItemsChange?.(newItems);
  }, [items, onItemsChange]);

  const handleStatusChange = useCallback((index: number, newStatus: AgendaItem['status']) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      status: newStatus,
      inicioDiscussao: newStatus === 'em_discussao' ? new Date() : newItems[index].inicioDiscussao
    };
    
    setItems(newItems);
    onItemsChange?.(newItems);
    
    // Se estamos iniciando discussão, definir como item atual
    if (newStatus === 'em_discussao') {
      onCurrentItemChange?.(index);
    }
  }, [items, onItemsChange, onCurrentItemChange]);

  const handleSave = useCallback(async () => {
    if (!onSaveAgenda) return;
    
    setSaving(true);
    try {
      await onSaveAgenda(items);
    } catch (error) {
      console.error('Erro ao salvar agenda:', error);
    } finally {
      setSaving(false);
    }
  }, [items, onSaveAgenda]);

  // Memoizar função de formatação de tempo
  const formatElapsedTime = useCallback((startTime: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
    return `${diff}min`;
  }, []);

  // Memoizar estado de edição ativa para evitar re-renders desnecessários
  const isEditing = useMemo(() => editingIndex !== -1, [editingIndex]);

  // Memoizar validação do formulário
  const isFormValid = useMemo(() => 
    Boolean(newItem.titulo && newItem.descricao && newItem.responsavel),
    [newItem.titulo, newItem.descricao, newItem.responsavel]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestão de Pauta
          </CardTitle>
          
          <div className="flex gap-2">
            {canManageAgenda && (
              <>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Item da Pauta</DialogTitle>
                      <DialogDescription>
                        Adicione um novo item à pauta da reunião
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Título</label>
                        <Input
                          value={newItem.titulo || ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, titulo: e.target.value }))}
                          placeholder="Título do item da pauta"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Descrição</label>
                        <Textarea
                          value={newItem.descricao || ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, descricao: e.target.value }))}
                          placeholder="Descrição detalhada do item"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Responsável</label>
                        <Input
                          value={newItem.responsavel || ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, responsavel: e.target.value }))}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Tempo Estimado (minutos)</label>
                        <Input
                          type="number"
                          min="5"
                          max="120"
                          value={newItem.tempoEstimado || 15}
                          onChange={(e) => setNewItem(prev => ({ ...prev, tempoEstimado: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddItem} disabled={!isFormValid}>
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {onSaveAgenda && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum item na pauta</h3>
            <p className="text-muted-foreground mb-4">
              Adicione itens à pauta para organizar a reunião
            </p>
            {canManageAgenda && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const statusInfo = getStatusInfo(item.status);
              const isCurrent = index === currentItemIndex;
              
              return (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {item.numero}
                    </Badge>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.titulo}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.descricao}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={statusInfo.variant} className="gap-1">
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                          
                          {isCurrent && item.status === 'em_discussao' && item.inicioDiscussao && (
                            <Badge variant="outline" className="gap-1">
                              <Timer className="h-3 w-3" />
                              {formatElapsedTime(item.inicioDiscussao)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.responsavel}
                        </div>
                        
                        {item.tempoEstimado && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.tempoEstimado}min estimado
                          </div>
                        )}
                        
                        {item.votos && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">👍 {item.votos.favoraveis}</span>
                            <span className="text-red-600">👎 {item.votos.contrarios}</span>
                            <span className="text-gray-600">⚪ {item.votos.abstencoes}</span>
                          </div>
                        )}
                      </div>
                      
                      {item.decisao && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Decisão:</strong> {item.decisao}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {canManageAgenda && isInProgress && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          {item.status === 'pendente' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(index, 'em_discussao')}
                            >
                              Iniciar Discussão
                            </Button>
                          )}
                          
                          {item.status === 'em_discussao' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(index, 'votacao')}
                              >
                                Abrir Votação
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(index, 'adiado')}
                              >
                                Adiar
                              </Button>
                            </>
                          )}
                          
                          {item.status === 'votacao' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(index, 'aprovado')}
                              >
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(index, 'rejeitado')}
                              >
                                Rejeitar
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      
                      {canManageAgenda && !isInProgress && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveItem(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveItem(index, 'down')}
                            disabled={index === items.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingIndex(index)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteItem(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default AgendaManager;