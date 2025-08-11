import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Plus, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReunioes } from "@/hooks/useReunioes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const getStatusVariant = (status: string): "default" | "destructive" | "success" | "secondary" | "outline" => {
  switch (status) {
    case 'agendada':
      return 'default';
    case 'realizada':
      return 'success';
    case 'cancelada':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'agendada': 'Agendada',
    'realizada': 'Realizada',
    'cancelada': 'Cancelada',
  };
  return statusMap[status] || status;
};

const Reunioes: React.FC = () => {
  const navigate = useNavigate();
  const { data: reunioes, isLoading, error } = useReunioes();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reuniões</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar reuniões: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reuniões</h1>
          <p className="text-muted-foreground">Gerencie as reuniões do CODEMA</p>
        </div>
        <Button onClick={() => navigate('/reunioes/nova')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Reunião
        </Button>
      </div>
      
      {!reunioes || reunioes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma reunião cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece agendando a primeira reunião do conselho.
            </p>
            <Button onClick={() => navigate('/reunioes/nova')}>
              <Plus className="h-4 w-4 mr-2" />
              Agendar Reunião
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reunioes.map((reuniao) => (
            <Card key={reuniao.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg">{reuniao.titulo}</CardTitle>
                  <Badge variant={getStatusVariant(reuniao.status)}>
                    {getStatusLabel(reuniao.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {reuniao.data_reuniao 
                        ? new Date(reuniao.data_reuniao).toLocaleString('pt-BR', { 
                            dateStyle: 'long', 
                            timeStyle: 'short' 
                          })
                        : 'Data não definida'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{reuniao.local || 'Local não definido'}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/reunioes/${reuniao.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reunioes;