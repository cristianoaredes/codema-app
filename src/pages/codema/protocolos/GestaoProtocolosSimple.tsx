import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function GestaoProtocolosSimple() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestão de Protocolos - Teste Simplificado</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Teste de Carregamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Se você está vendo esta mensagem, o componente está carregando corretamente.</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}