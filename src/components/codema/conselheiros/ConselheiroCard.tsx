import React, { useState } from 'react';
import { MoreVertical, Mail, Phone, Calendar, Building, AlertTriangle, Edit, Trash2, User } from 'lucide-react';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Conselheiro } from '@/types/conselheiro';

interface ConselheiroCardProps {
  conselheiro: Conselheiro;
  onEdit?: (conselheiro: Conselheiro) => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

const ConselheiroCard: React.FC<ConselheiroCardProps> = ({
  conselheiro,
  onEdit,
  onDelete,
  canEdit = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'inativo':
        return 'bg-muted text-muted-foreground';
      case 'licenciado':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'afastado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSegmentoIcon = (segmento: string) => {
    switch (segmento) {
      case 'governo':
        return '🏛️';
      case 'sociedade_civil':
        return '👥';
      case 'setor_produtivo':
        return '🏭';
      default:
        return '📋';
    }
  };

  const isNearExpiration = () => {
    const today = new Date();
    const mandatoFim = new Date(conselheiro.mandato_fim);
    const diffTime = mandatoFim.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays > 0;
  };

  const isExpired = () => {
    const today = new Date();
    const mandatoFim = new Date(conselheiro.mandato_fim);
    return mandatoFim < today;
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(conselheiro.nome_completo)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg leading-tight">
                  {conselheiro.nome_completo}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {conselheiro.titular ? 'Conselheiro Titular' : 'Conselheiro Suplente'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {(isNearExpiration() || isExpired()) && (
                <AlertTriangle 
                  className={`h-5 w-5 ${isExpired() ? 'text-red-500' : 'text-amber-500'}`}
                />
              )}
              <Badge className={getStatusColor(conselheiro.status)}>
                {conselheiro.status}
              </Badge>
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowDetails(true)}>
                      <User className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(conselheiro)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete?.()}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{conselheiro.entidade_representada}</span>
            <span className="text-lg">{getSegmentoIcon(conselheiro.segmento)}</span>
          </div>

          {conselheiro.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{conselheiro.email}</span>
            </div>
          )}

          {conselheiro.telefone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{conselheiro.telefone}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Mandato: {format(new Date(conselheiro.mandato_inicio), 'MMM/yyyy', { locale: ptBR })} - {format(new Date(conselheiro.mandato_fim), 'MMM/yyyy', { locale: ptBR })}
            </span>
          </div>

          {conselheiro.total_faltas > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t">
              <span>Faltas: {conselheiro.total_faltas}</span>
              {conselheiro.faltas_consecutivas > 0 && (
                <span className="text-amber-600">
                  Consecutivas: {conselheiro.faltas_consecutivas}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(conselheiro.nome_completo)}</AvatarFallback>
              </Avatar>
              <span>{conselheiro.nome_completo}</span>
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas do conselheiro
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-sm">Tipo</label>
                <p>{conselheiro.titular ? 'Titular' : 'Suplente'}</p>
              </div>
              <div>
                <label className="font-medium text-sm">Status</label>
                <Badge className={getStatusColor(conselheiro.status)}>
                  {conselheiro.status}
                </Badge>
              </div>
            </div>

            <div>
              <label className="font-medium text-sm">Entidade Representada</label>
              <p className="flex items-center space-x-2">
                <span>{conselheiro.entidade_representada}</span>
                <span className="text-lg">{getSegmentoIcon(conselheiro.segmento)}</span>
                <span className="text-sm text-muted-foreground">({conselheiro.segmento.replace('_', ' ')})</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-sm">Mandato Início</label>
                <p>{format(new Date(conselheiro.mandato_inicio), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
              <div>
                <label className="font-medium text-sm">Mandato Fim</label>
                <p className={isExpired() ? 'text-red-600' : isNearExpiration() ? 'text-amber-600' : ''}>
                  {format(new Date(conselheiro.mandato_fim), 'dd/MM/yyyy', { locale: ptBR })}
                  {isExpired() && ' (Expirado)'}
                  {isNearExpiration() && !isExpired() && ' (Próximo ao vencimento)'}
                </p>
              </div>
            </div>

            {(conselheiro.email || conselheiro.telefone) && (
              <div className="grid grid-cols-2 gap-4">
                {conselheiro.email && (
                  <div>
                    <label className="font-medium text-sm">Email</label>
                    <p className="break-all">{conselheiro.email}</p>
                  </div>
                )}
                {conselheiro.telefone && (
                  <div>
                    <label className="font-medium text-sm">Telefone</label>
                    <p>{conselheiro.telefone}</p>
                  </div>
                )}
              </div>
            )}

            {(conselheiro.total_faltas > 0 || conselheiro.faltas_consecutivas > 0) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-sm">Total de Faltas</label>
                  <p>{conselheiro.total_faltas}</p>
                </div>
                <div>
                  <label className="font-medium text-sm">Faltas Consecutivas</label>
                  <p className={conselheiro.faltas_consecutivas >= 3 ? 'text-red-600' : 'text-amber-600'}>
                    {conselheiro.faltas_consecutivas}
                    {conselheiro.faltas_consecutivas >= 3 && ' (⚠️ Limite atingido)'}
                  </p>
                </div>
              </div>
            )}

            {conselheiro.observacoes && (
              <div>
                <label className="font-medium text-sm">Observações</label>
                <p className="text-sm text-muted-foreground mt-1">{conselheiro.observacoes}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p>Cadastrado em: {format(new Date(conselheiro.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              <p>Última atualização: {format(new Date(conselheiro.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConselheiroCard;