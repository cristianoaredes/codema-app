import { useState } from 'react';
// ...imports unchanged

// Add justificativa_ausencia as optional property to Presenca type
interface Presenca {
  id: string;
  reuniao_id: string;
  conselheiro_id: string;
  presente: boolean;
  horario_chegada?: string;
  horario_saida?: string;
  observacoes?: string;
  justificativa_ausencia?: string;
  created_at: string;
}

export function PresencasManager({ reuniao_id, quorum_necessario = 7 }: PresencasManagerProps) {
  // ...unchanged
}