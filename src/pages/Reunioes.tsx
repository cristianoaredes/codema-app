import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Reuniao {
  id: string;
  titulo: string;
  tipo: string;
  data_reuniao: string;
  local: string;
  pauta: string;
  ata: string;
  status: string;
  created_at: string;
}

const Reunioes = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReunioes();
    }
  }, [user]);

  const fetchReunioes = async () => {
    try {
      const { data, error } = await supabase
        .from("reunioes")
        .select("*")
        .order("data_reuniao", { ascending: false });

      if (error) throw error;
      setReunioes(data || []);
    } catch (error) {
      console.error("Erro ao carregar reuniões:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as reuniões.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "realizada":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "ordinaria":
        return "bg-primary/10 text-primary border-primary/20";
      case "extraordinaria":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "audiencia_publica":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "agendada": return "Agendada";
      case "realizada": return "Realizada";
      case "cancelada": return "Cancelada";
      default: return status;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "ordinaria": return "Ordinária";
      case "extraordinaria": return "Extraordinária";
      case "audiencia_publica": return "Audiência Pública";
      default: return tipo;
    }
  };

  const canManageReunioes = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando reuniões...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reuniões CODEMA
          </h1>
          <p className="text-muted-foreground">
            Acompanhe as reuniões do Conselho de Defesa do Meio Ambiente
          </p>
        </div>
        {canManageReunioes && (
          <Link to="/reunioes/nova">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Reunião
            </Button>
          </Link>
        )}
      </div>

      {/* Reuniões List */}
      <div className="space-y-6">
        {reunioes.length > 0 ? (
          reunioes.map((reuniao) => (
            <Card key={reuniao.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{reuniao.titulo}</CardTitle>
                      <Badge className={getTipoColor(reuniao.tipo)}>
                        {getTipoLabel(reuniao.tipo)}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {reuniao.pauta && (
                        <div className="mb-2">
                          <strong>Pauta:</strong> {reuniao.pauta}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(reuniao.status)}>
                    {getStatusLabel(reuniao.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(reuniao.data_reuniao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {reuniao.local}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Criada em {new Date(reuniao.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {reuniao.ata && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Ata da Reunião
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {reuniao.ata.length > 200 
                        ? `${reuniao.ata.substring(0, 200)}...` 
                        : reuniao.ata
                      }
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  {canManageReunioes && (
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma reunião encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Ainda não há reuniões cadastradas no sistema.
              </p>
              {canManageReunioes && (
                <Link to="/reunioes/nova">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeira reunião
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reunioes;