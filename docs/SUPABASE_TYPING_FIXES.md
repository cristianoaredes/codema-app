# 🔧 Correção de Tipagem Supabase

## 📊 **Análise dos Problemas**

### **Problema Principal**
O Supabase está retornando erros de tipagem para tabelas que não estão no schema gerado:
- `atas_templates`
- `conselheiros` 
- `resolucoes_templates`
- `persistent_sessions`

### **Causa Raiz**
As tabelas foram criadas via migrations mas não estão no schema TypeScript gerado pelo Supabase CLI.

## 🎯 **Plano de Correção**

### **Etapa 1: Verificar Schema Atual**
```bash
# Verificar se o schema está atualizado
npx supabase gen types typescript --local > src/types/supabase.ts
```

### **Etapa 2: Criar Tipos Customizados**
Para tabelas que não estão no schema gerado, criar tipos customizados:

```typescript
// src/types/custom-tables.ts
export interface AtasTemplate {
  id: string;
  nome: string;
  conteudo: string;
  tipo: 'ordinaria' | 'extraordinaria' | 'publica';
  created_at?: string;
  updated_at?: string;
}

export interface Conselheiro {
  id: string;
  nome_completo: string;
  mandato_inicio: string;
  mandato_fim: string;
  entidade_representada: string;
  tipo: 'titular' | 'suplente';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResolucaoTemplate {
  id: string;
  nome: string;
  conteudo: string;
  tipo: 'normativa' | 'deliberativa' | 'administrativa';
  created_at?: string;
  updated_at?: string;
}

export interface PersistentSession {
  user_id: string;
  device_id: string;
  refresh_token: string;
  expires_at: string;
  device_info: Record<string, unknown>;
  last_used: string;
  created_at?: string;
}
```

### **Etapa 3: Criar Helpers de Acesso**
```typescript
// src/utils/supabase-helpers.ts
import { supabase } from '@/integrations/supabase/client';
import type { AtasTemplate, Conselheiro, ResolucaoTemplate, PersistentSession } from '@/types/custom-tables';

// Helper para acessar tabelas customizadas
export const getCustomTable = <T>(tableName: string) => {
  return (supabase as any).from(tableName) as SupabaseQueryBuilder<T>;
};

// Helpers específicos
export const getAtasTemplatesTable = () => getCustomTable<AtasTemplate>('atas_templates');
export const getConselheirosTable = () => getCustomTable<Conselheiro>('conselheiros');
export const getResolucoesTemplatesTable = () => getCustomTable<ResolucaoTemplate>('resolucoes_templates');
export const getPersistentSessionsTable = () => getCustomTable<PersistentSession>('persistent_sessions');
```

### **Etapa 4: Atualizar Componentes**
Substituir acessos diretos por helpers tipados:

```typescript
// Antes
const { data, error } = await supabase
  .from('conselheiros')
  .select('*');

// Depois  
const { data, error } = await getConselheirosTable()
  .select('*');
```

## 🚀 **Implementação**

### **Prioridade Alta**
1. ✅ Imports corrigidos
2. 🔄 Criar tipos customizados
3. 🔄 Implementar helpers de acesso
4. 🔄 Atualizar componentes críticos

### **Prioridade Média**
1. 🔄 Atualizar todos os componentes
2. 🔄 Adicionar validação de tipos
3. 🔄 Implementar error handling

### **Prioridade Baixa**
1. 🔄 Otimizar queries
2. 🔄 Adicionar cache
3. 🔄 Implementar retry logic

## 📈 **Benefícios Esperados**

- ✅ Build sem erros
- ✅ Tipagem forte
- ✅ Melhor DX (Developer Experience)
- ✅ Código mais manutenível
- ✅ Facilita refatoração futura 