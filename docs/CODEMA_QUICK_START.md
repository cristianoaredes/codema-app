# CODEMA - Guia de Início Rápido

## 🚀 Como Começar HOJE

Este guia te levará do zero ao primeiro commit funcional em **2 horas**.

## Pré-requisitos ✅

- Node.js 18+ instalado
- Git configurado
- Editor de código (VS Code recomendado)
- Acesso ao repositório

## Setup Inicial (15 min)

### 1. Clone e Setup
```bash
# Se ainda não fez
git clone [url-do-repo]
cd codema-app

# Instalar dependências
npm install

# Verificar se roda
npm run dev
```

### 2. Verificar Estrutura Atual
```bash
# Verificar páginas existentes
ls src/pages/

# Verificar componentes
ls src/components/

# Verificar se Supabase está conectado
# Abrir http://localhost:3000 e fazer login
```

## Quick Win #1: Numeração Automática (30 min)

### Criar Utilitário
```bash
mkdir -p src/utils
touch src/utils/numeroGenerator.ts
```

```typescript
// src/utils/numeroGenerator.ts
import { supabase } from '@/integrations/supabase/client';

export async function gerarNumeroProcesso(tipo: 'PROC' | 'RES' | 'OUV'): Promise<string> {
  const ano = new Date().getFullYear();
  
  // Buscar último número do tipo no ano
  const { data, error } = await supabase
    .from(getTabelaPorTipo(tipo))
    .select('numero_processo')
    .like('numero_processo', `${tipo}-%/${ano}`)
    .order('numero_processo', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('Erro ao gerar número:', error);
    return `${tipo}-001/${ano}`;
  }
  
  let proximoNumero = 1;
  if (data && data.length > 0) {
    const ultimoNumero = data[0].numero_processo;
    const sequencial = parseInt(ultimoNumero.split('-')[1].split('/')[0]);
    proximoNumero = sequencial + 1;
  }
  
  return `${tipo}-${proximoNumero.toString().padStart(3, '0')}/${ano}`;
}

function getTabelaPorTipo(tipo: string): string {
  switch (tipo) {
    case 'PROC': return 'processos';
    case 'RES': return 'resolucoes';
    case 'OUV': return 'ouvidoria_denuncias';
    default: return 'processos';
  }
}
```

### Testar Imediatamente
```typescript
// src/utils/test.ts (apenas para teste)
import { gerarNumeroProcesso } from './numeroGenerator';

async function testar() {
  const numero = await gerarNumeroProcesso('PROC');
  console.log('Número gerado:', numero); // PROC-001/2024
}

testar();
```

## Quick Win #2: Logs de Auditoria (45 min)

### Migration Simples
```bash
npx supabase migration new add_audit_logs
```

```sql
-- supabase/migrations/[timestamp]_add_audit_logs.sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
```

### Aplicar Migration
```bash
npx supabase db push
```

### Criar Logger
```typescript
// src/utils/auditLogger.ts
import { supabase } from '@/integrations/supabase/client';

export async function logAction(
  action: string,
  entity: string,
  entityId: string,
  details?: any
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action,
      entity,
      entity_id: entityId,
      details,
      ip_address: '127.0.0.1' // Simplificado por agora
    });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}
```

### Usar em Ação Existente
```typescript
// Em qualquer página existente (ex: src/pages/Processos.tsx)
import { logAction } from '@/utils/auditLogger';

// Adicionar após criar/editar processo
await logAction('CREATE', 'processo', novoProcesso.id, { titulo: processo.titulo });
```

## Quick Win #3: Contador de Quórum (30 min)

### Componente Simples
```typescript
// src/components/QuorumIndicator.tsx
import { Badge } from '@/components/ui/badge';
import { Users, Check, X } from 'lucide-react';

interface QuorumIndicatorProps {
  totalConselheiros: number;
  presentes: number;
}

export function QuorumIndicator({ totalConselheiros, presentes }: QuorumIndicatorProps) {
  const quorumNecessario = Math.floor(totalConselheiros / 2) + 1;
  const quorumAtingido = presentes >= quorumNecessario;
  
  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4" />
      <span className="text-sm">
        {presentes}/{totalConselheiros} presentes
      </span>
      <Badge variant={quorumAtingido ? 'default' : 'destructive'}>
        {quorumAtingido ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            Quórum atingido
          </>
        ) : (
          <>
            <X className="h-3 w-3 mr-1" />
            Quórum não atingido
          </>
        )}
      </Badge>
    </div>
  );
}
```

### Adicionar à Página de Reuniões
```typescript
// Em src/pages/Reunioes.tsx - adicionar onde faz sentido
import { QuorumIndicator } from '@/components/QuorumIndicator';

// Dentro do componente
<QuorumIndicator 
  totalConselheiros={12} 
  presentes={8} 
/>
```

## Teste Completo (15 min)

### 1. Verificar se tudo funciona
```bash
npm run dev
```

### 2. Testar na interface
- Login no sistema
- Ir em Reuniões → ver contador de quórum
- Ir em Processos → criar um processo e ver se o número é gerado
- Verificar se logs estão sendo criados

### 3. Commit das mudanças
```bash
git add .
git commit -m "feat: adiciona numeração automática, logs de auditoria e contador de quórum

- Implementa gerador de números únicos para processos
- Adiciona sistema básico de auditoria
- Cria componente de indicador de quórum
- Preparação para compliance legal CODEMA

🎯 Quick wins: 3 funcionalidades críticas implementadas"
```

## Próximo Sprint: Módulo Conselheiros (2-3 dias)

### Dia 1: Backend
```bash
# Criar migration para conselheiros
npx supabase migration new add_conselheiros_module

# Criar tipos TypeScript
touch src/types/conselheiro.ts

# Criar hooks
touch src/hooks/useConselheiros.ts
```

### Dia 2: Frontend Básico
```bash
# Criar estrutura de páginas
mkdir -p src/pages/codema/conselheiros
touch src/pages/codema/conselheiros/index.tsx
touch src/pages/codema/conselheiros/novo.tsx

# Criar componentes
mkdir -p src/components/codema
touch src/components/codema/ConselheirosTable.tsx
```

### Dia 3: Integração e Testes
- Adicionar rotas ao App.tsx
- Adicionar menu ao AppSidebar.tsx
- Testar tudo
- Commit

## Checklist de Cada Feature

Antes de considerar "pronto":
- [ ] Funciona no navegador
- [ ] Responsivo (mobile)
- [ ] Log de auditoria implementado
- [ ] Permissões corretas
- [ ] Mensagens de erro em português
- [ ] Loading states
- [ ] Commit com boa descrição

## 🎯 Meta do Primeiro Dia

Ao final do dia você deve ter:
1. ✅ Numeração automática funcionando
2. ✅ Logs de auditoria sendo salvos
3. ✅ Contador de quórum visual
4. ✅ Tudo commitado
5. ✅ Próximos passos planejados

**Tempo total: ~2h30min**

---

💡 **Dica final**: Não tente fazer tudo perfeito. Faça funcionar primeiro, melhore depois!