import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Dummy convocacoes for demonstration
const convocacoes = [
  {
    id: "1",
    conselheiro_id: "abc123",
    status: "enviada",
    confirmacao_presenca: "confirmada"
  }
];

export default function ReuniaoDetailPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Status das Convocações</CardTitle>
          <CardDescription>
            Acompanhe o envio e confirmação das convocações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {convocacoes.length > 0 ? (
            <>
              <div className="space-y-2">
                {convocacoes.map((convocacao) => (
                  <div key={convocacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{convocacao.conselheiro_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={convocacao.status === 'enviada' ? 'default' : 'secondary'}>
                        {convocacao.status}
                      </Badge>
                      <Badge 
                        variant={
                          convocacao.confirmacao_presenca === 'confirmada' ? 'default' :
                          convocacao.confirmacao_presenca === 'rejeitada' ? 'destructive' : 'secondary'
                        }
                      >
                        {convocacao.confirmacao_presenca}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent>
                Nenhuma convocação encontrada.
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}