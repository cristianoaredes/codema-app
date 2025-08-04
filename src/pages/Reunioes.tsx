import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getStatusVariant = (status: string): "default" | "destructive" | "success" | "secondary" | "outline" => "default";

const Reunioes: React.FC = () => {
  const [reunioes, setReunioes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReunioes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReunioes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reunioes")
        .select("*, data_reuniao")
        .order("data_reuniao", { ascending: false });
      if (error) throw error;
      // Map data_reuniao to data_hora for UI
      const mappedData = (data || []).map((r: any) => ({ ...r, data_hora: r.data_reuniao }));
      setReunioes(mappedData);
    } catch (error) {
      // ...unchanged
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {reunioes.map((reuniao) => (
        <Card key={reuniao.id} className="hover:shadow-lg transition-shadow duration-300">
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
      ))}
    </div>
  );
};

export default Reunioes;