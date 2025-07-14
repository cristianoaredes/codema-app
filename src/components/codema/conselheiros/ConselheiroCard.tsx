import { useState } from 'react';
import { MoreVertical, Mail, Phone, Calendar, Building, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Conselheiro } from '@/types/conselheiro';
import { ConselheiroForm } from './ConselheiroForm';
import { useDeleteConselheiro } from '@/hooks/useConselheiros';
import { format, isBefore, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConselheiroCardProps {
  conselheiro: Conselheiro;
}

export function ConselheiroCard({ conselheiro }: ConselheiroCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const deleteConselheiro = useDeleteConselheiro();

  const mandatoFim = new Date(conselheiro.mandato_fim);
  const hoje = new Date();
  const diasParaVencimento = differenceInDays(mandatoFim, hoje);
  const mandatoExpirando = diasParaVencimento <= 30 && diasParaVencimento >= 0;
  const mandatoVencido = isBefore(mandatoFim, hoje);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'licenciado': return 'bg-yellow-100 text-yellow-800';
      case 'afastado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSegmentoColor = (segmento: string) => {
    switch (segmento) {
      case 'governo': return 'bg-blue-100 text-blue-800';
      case 'sociedade_civil': return 'bg-purple-100 text-purple-800';
      case 'setor_produtivo': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSegmentoLabel = (segmento: string) => {
    switch (segmento) {
      case 'governo': return 'Governo';
      case 'sociedade_civil': return 'Sociedade Civil';
      case 'setor_produtivo': return 'Setor Produtivo';
      default: return segmento;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteConselheiro.mutateAsync(conselheiro.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao deletar conselheiro:', error);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {conselheiro.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conselheiro.nome_completo}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {conselheiro.entidade_representada}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Status and Alerts */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(conselheiro.status)}>
              {conselheiro.status}
            </Badge>
            <Badge className={getSegmentoColor(conselheiro.segmento)}>
              {getSegmentoLabel(conselheiro.segmento)}
            </Badge>
            {conselheiro.titular && (
              <Badge variant="outline">Titular</Badge>
            )}
          </div>

          {/* Mandate Alert */}
          {(mandatoExpirando || mandatoVencido) && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {mandatoVencido 
                  ? 'Mandato vencido'
                  : `Mandato expira em ${diasParaVencimento} dias`
                }
              </span>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2">
            {conselheiro.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span className="truncate">{conselheiro.email}</span>
              </div>
            )}
            {conselheiro.telefone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{conselheiro.telefone}</span>
              </div>
            )}
          </div>

          {/* Mandate Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(conselheiro.mandato_inicio), 'dd/MM/yyyy', { locale: ptBR })} - {' '}
                {format(new Date(conselheiro.mandato_fim), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
            {conselheiro.mandato_numero && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>Mandato nº {conselheiro.mandato_numero}</span>
              </div>
            )}
          </div>

          {/* Attendance Info */}
          {conselheiro.faltas_consecutivas > 0 && (
            <div className="text-sm text-red-600">
              {conselheiro.faltas_consecutivas} falta(s) consecutiva(s)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Conselheiro</DialogTitle>
            <DialogDescription>
              Atualize as informações do conselheiro
            </DialogDescription>
          </DialogHeader>
          <ConselheiroForm 
            conselheiro={conselheiro}
            onSuccess={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o conselheiro {conselheiro.nome_completo}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteConselheiro.isPending}
            >
              {deleteConselheiro.isPending ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}