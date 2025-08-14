import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AgendaItem } from './AgendaManager';

interface AgendaItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: AgendaItem;
  onSave: (item: Partial<AgendaItem>) => void;
  onCancel: () => void;
}

export function AgendaItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
  onCancel
}: AgendaItemDialogProps) {
  const [formData, setFormData] = useState<Partial<AgendaItem>>({
    titulo: item?.titulo || '',
    descricao: item?.descricao || '',
    responsavel: item?.responsavel || '',
    tempoEstimado: item?.tempoEstimado || 15,
    observacoes: item?.observacoes || ''
  });

  const isEditing = Boolean(item);
  const isValid = Boolean(formData.titulo && formData.descricao && formData.responsavel);

  const handleSave = () => {
    if (isValid) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Item da Pauta' : 'Novo Item da Pauta'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite as informações do item da pauta'
              : 'Adicione um novo item à pauta da reunião'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              value={formData.titulo || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Título do item da pauta"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={formData.descricao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição detalhada do item"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Responsável</label>
            <Input
              value={formData.responsavel || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Nome do responsável"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tempo Estimado (minutos)</label>
            <Input
              type="number"
              min="5"
              max="120"
              value={formData.tempoEstimado || 15}
              onChange={(e) => setFormData(prev => ({ ...prev, tempoEstimado: parseInt(e.target.value) || 15 }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais (opcional)"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {isEditing ? 'Salvar Alterações' : 'Adicionar Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AgendaItemDialog;