import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

export default function GestaoProtocolosDebug() {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Testing database connection...');
      
      // Test 1: Check if table exists
      const { data: tableData, error: tableError } = await supabase
        .from('protocolos_sequencia')
        .select('*')
        .limit(1);
      
      if (tableError) {
        setError(`Table error: ${tableError.message}`);
        return;
      }
      
      setStatus('Table exists. Testing RPC function...');
      
      // Test 2: Try to call RPC function
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('consultar_proximo_protocolo', { tipo_protocolo: 'PROC' });
      
      if (rpcError) {
        setError(`RPC error: ${rpcError.message}`);
        return;
      }
      
      setData({
        tableRows: tableData?.length || 0,
        nextProtocol: rpcData
      });
      
      setStatus('All tests passed!');
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`);
    }
  };

  const testGerarProtocolo = async () => {
    try {
      setStatus('Generating protocol...');
      
      const { data, error } = await supabase
        .rpc('gerar_protocolo', { tipo_protocolo: 'PROC' });
      
      if (error) {
        setError(`Generate error: ${error.message}`);
        return;
      }
      
      setData(prev => ({
        ...prev,
        generatedProtocol: data
      }));
      
      setStatus('Protocol generated successfully!');
      testConnection(); // Refresh data
    } catch (err: any) {
      setError(`Generate error: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestão de Protocolos - Debug</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Status: <strong>{status}</strong></p>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {data && (
            <div className="space-y-2">
              <p>Table rows: {data.tableRows}</p>
              <p>Next protocol: {data.nextProtocol || 'N/A'}</p>
              {data.generatedProtocol && (
                <p>Last generated: {data.generatedProtocol}</p>
              )}
            </div>
          )}
          
          <div className="mt-4 space-x-2">
            <Button onClick={testConnection}>Refresh</Button>
            <Button onClick={testGerarProtocolo} variant="secondary">
              Test Generate Protocol
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ status, error, data }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}