import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { BreadcrumbWithActions, SmartBreadcrumb } from "@/components/navigation/SmartBreadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Reuniao } from "@/types";

const ReuniaoCard = ({ reuniao }: { reuniao: Reuniao }) => {
  const navigate = useNavigate();
  
  const getStatusVariant = (status: string): "default" | "success" | "destructive" | "secondary" => {
    const statusMap: Record<string, "default" | "success" | "destructive"> = {
      agendada: 'default',
      realizada: 'success',
      cancelada: 'destructive',
    };
    return statusMap[status] || 'secondary';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg">{reuniao.titulo}</CardTitle>
          <Badge variant={getStatusVariant(reuniao.status)}>{reuniao.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(reuniao.data_hora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{reuniao.local}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => navigate(`/reunioes/${reuniao.id}`)}>
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ReunioesPage = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReunioes();
  }, []);

  const fetchReunioes = async () => {
    try {
      const { data, error } = await supabase
        .from("reunioes")
        .select("*, data_reuniao") // Explicitly select the column
        .order("data_reuniao", { ascending: false });
      if (error) throw error;
      
      const mappedData = data?.map(r => ({ ...r, data_hora: r.data_reuniao }));
      setReunioes(mappedData || []);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const { proximas, passadas, canceladas } = useMemo(() => {
    const agora = new Date();
    return reunioes.reduce((acc, r) => {
      if (r.status === 'cancelada') acc.canceladas.push(r);
      else if (new Date(r.data_hora) >= agora) acc.proximas.push(r);
      else acc.passadas.push(r);
      return acc;
    }, { proximas: [], passadas: [], canceladas: [] });
  }, [reunioes]);

  const canManageReunioes = profile?.role && (
    ['admin', 'secretario', 'presidente'].includes(profile.role) ||
    (profile.role === 'vice_presidente' && profile.is_acting_president === true)
  );
  
  const renderReunioesList = (list: Reuniao[], emptyMessage: string) => {
    if (loading) {
      return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({length: 3}).map((_, i) => <CardSkeleton key={i} className="h-48" />)}
      </div>
    }
    if (list.length === 0) {
      return (
        <div className="text-center py-16">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma reunião encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {list.map(r => <ReuniaoCard key={r.id} reuniao={r} />)}
    </div>
  };

  return (
    <div className="space-y-6">
      <BreadcrumbWithActions
        title="Reuniões CODEMA"
        description="Acompanhe, agende e gerencie as reuniões do conselho."
        actions={
          canManageReunioes && (
            <Link to="/reunioes/nova"><Button><Plus className="w-4 h-4 mr-2" />Nova Reunião</Button></Link>
          )
        }
      >
        <SmartBreadcrumb />
      </BreadcrumbWithActions>

      <Tabs defaultValue="proximas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="proximas">Próximas ({proximas.length})</TabsTrigger>
          <TabsTrigger value="passadas">Passadas ({passadas.length})</TabsTrigger>
          <TabsTrigger value="canceladas">Canceladas ({canceladas.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="proximas">
          {renderReunioesList(proximas, "Não há reuniões agendadas.")}
        </TabsContent>
        <TabsContent value="passadas">
          {renderReunioesList(passadas, "Nenhuma reunião foi realizada ainda.")}
        </TabsContent>
        <TabsContent value="canceladas">
          {renderReunioesList(canceladas, "Nenhuma reunião foi cancelada.")}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReunioesPage;