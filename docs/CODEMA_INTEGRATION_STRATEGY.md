# Estratégia de Integração - CODEMA Features

## Contexto Atual

O sistema já possui uma base sólida com:
- ✅ Autenticação e autorização (Supabase)
- ✅ Estrutura de páginas para principais módulos
- ✅ Sistema de roles (admin, secretário, presidente, conselheiros)
- ✅ Navegação lateral com role-based access
- ✅ Tabelas base no banco de dados

## Estratégia de Integração por Módulo

### 1. Módulo Conselheiros - NOVO

**Onde integrar:**
- Adicionar novo item no `AppSidebar.tsx` após "Dashboard"
- Criar rota `/codema/conselheiros` no `App.tsx`
- Reaproveitar componente `Card` e padrões visuais existentes

**Como integrar com existente:**
```typescript
// Em AppSidebar.tsx - adicionar após Dashboard
{ title: "Conselheiros", url: "/codema/conselheiros", icon: Users },

// Relacionamento com profiles
interface Conselheiro extends Profile {
  mandato_inicio: Date;
  mandato_fim: Date;
  entidade_representada: string;
  segmento: string;
  faltas_consecutivas: number;
}
```

### 2. Aprimoramento de Reuniões

**O que já existe:**
- Página `/reunioes` com listagem
- Tabela `reunioes` no banco

**Como aprimorar:**
```typescript
// Adicionar à página existente
- Tab "Convocações" com sistema de envio
- Modal de confirmação de presença
- Seção de geração de atas
- Integração com novo módulo de conselheiros para quórum
```

### 3. Atas Eletrônicas - INTEGRAR

**Onde adicionar:**
- Como sub-rota de reuniões: `/reunioes/:id/ata`
- Ou tab dentro da página de detalhes da reunião

**Integração:**
```typescript
// Usar o mesmo layout/componentes das outras páginas
// Adicionar editor rico (já tem react-hook-form)
// Modal para assinatura digital
```

### 4. Resoluções - NOVO

**Onde integrar:**
- Nova rota `/codema/resolucoes`
- Adicionar ao sidebar após "Documentos"
- Relacionar com reuniões (resolução aprovada em reunião X)

### 5. Portal Transparência - NOVO

**Estratégia diferente:**
- Rota pública `/transparencia` (sem autenticação)
- Layout diferente (sem sidebar)
- Reaproveitar componentes de visualização

## Padrões de Código a Seguir

### 1. Estrutura de Arquivos
```
src/
├── pages/
│   └── codema/
│       ├── conselheiros/
│       │   ├── index.tsx      (listagem)
│       │   ├── [id].tsx       (detalhes)
│       │   └── novo.tsx       (criar)
│       └── resolucoes/
│           └── ...
├── components/
│   └── codema/
│       ├── ConselheirosTable.tsx
│       ├── MandatoAlert.tsx
│       └── ...
└── hooks/
    └── codema/
        ├── useConselheiros.ts
        └── useResolucoes.ts
```

### 2. Padrão de Hooks (seguir o existente)
```typescript
// Exemplo baseado no padrão atual
export function useConselheiros() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['conselheiros'],
    queryFn: fetchConselheiros
  });
  
  return { conselheiros: data, error, isLoading };
}
```

### 3. Padrão de Formulários
```typescript
// Usar react-hook-form + zod como já existe
const formSchema = z.object({
  nome: z.string().min(3),
  mandato_inicio: z.date(),
  // ...
});

// Componente seguindo padrão atual
export function ConselheirosForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });
  // ...
}
```

## Ordem de Implementação Recomendada

### Fase 1: Quick Wins (1 semana)
1. **Numeração automática** nos módulos existentes
   - Adicionar em Processos: `PROC-001/2024`
   - Adicionar em Ouvidoria: `OUV-001/2024`

2. **Melhorias em Reuniões**
   - Contador de quórum
   - Lista de presença clicável

3. **Export PDF básico**
   - Botão export em Documentos
   - Relatório simples FMA

### Fase 2: Módulos Críticos (2-3 semanas)
1. **Módulo Conselheiros completo**
   - CRUD
   - Alertas de mandato
   - Integração com reuniões

2. **Sistema de Auditoria**
   - Middleware de logging
   - Tabela audit_logs

3. **Atas Eletrônicas**
   - Editor integrado em reuniões
   - Assinatura básica (sem gov.br ainda)

### Fase 3: Compliance Total (3-4 semanas)
1. **Portal Transparência**
   - Página pública
   - Dados em tempo real

2. **Resoluções**
   - Sistema completo
   - Votação nominal

3. **Convocações automatizadas**
   - Email/WhatsApp
   - Confirmação presença

## Considerações Técnicas

### 1. Não Quebrar o Existente
- Todos os novos módulos devem seguir os padrões atuais
- Usar os mesmos componentes UI (shadcn/ui)
- Manter consistência visual

### 2. Migrations Incrementais
```sql
-- Não alterar tabelas existentes, adicionar novas
CREATE TABLE conselheiros (
  id UUID REFERENCES profiles(id),
  mandato_inicio DATE NOT NULL,
  -- ...
);

-- Usar ALTER TABLE com cuidado
ALTER TABLE reunioes 
ADD COLUMN convocacao_enviada BOOLEAN DEFAULT false;
```

### 3. Backward Compatibility
- APIs devem manter contratos existentes
- Novas features via feature flags se necessário
- Rollback plan para cada deploy

## Testes de Integração

### Para cada novo módulo:
1. **Teste de navegação**: novo item aparece no menu correto
2. **Teste de permissão**: apenas roles corretas acessam
3. **Teste de fluxo**: integração com módulos existentes
4. **Teste de dados**: migrations não quebram dados existentes

### Exemplo de teste:
```typescript
test('conselheiro pode ver reuniões mas não pode convocar', async () => {
  const user = await loginAs('conselheiro_titular');
  
  await expect(page.getByText('Reuniões')).toBeVisible();
  await page.click('text=Reuniões');
  
  await expect(page.getByText('Convocar Reunião')).not.toBeVisible();
});
```

## Riscos de Integração

| Risco | Mitigação |
|-------|-----------|
| Quebrar features existentes | Testes E2E abrangentes |
| Conflitos de migration | Review cuidadoso, backup antes |
| Performance degradada | Índices apropriados, lazy loading |
| UX inconsistente | Design system rígido |
| Conflitos de merge | Feature branches curtas |

## Checklist de Integração

Antes de fazer merge de qualquer feature nova:

- [ ] Funciona com dados existentes?
- [ ] Navegação consistente?
- [ ] Permissões respeitadas?
- [ ] Performance aceitável?
- [ ] Mobile responsive?
- [ ] Testes passando?
- [ ] Documentação atualizada?
- [ ] Migration reversível?