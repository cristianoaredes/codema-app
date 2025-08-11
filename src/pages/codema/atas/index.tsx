import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AtasPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Atas das Reuniões</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página de gestão de atas em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AtasPage;