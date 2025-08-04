import { useState } from 'react';
// ...imports unchanged

export default function ReuniaoDetailPage() {
  // ...unchanged

  return (
    <div className="container mx-auto px-6 py-8">
      {/* ... */}
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
              {/* ... */}
              <div className="space-y-2">
                {convocacoes.map((convocacao) => (
                  <div key={convocacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{convocacao.conselheiro_id}</p>
                        {/* If you have a way to resolve conselheiro_id to a name, do it here */}
                        {/* <p className="text-sm text-gray-600">{convocacao.email}</p> */}
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
            // ...unchanged
          )}
        </CardContent>
      </Card>
      {/* ... */}
    </div>
  );
}