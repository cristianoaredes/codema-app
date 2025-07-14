# Prompt para Desenvolvimento do Sistema CODEMA

## Contexto do Projeto

Você está desenvolvendo o **Sistema de Gestão do CODEMA** (Conselho Municipal de Defesa do Meio Ambiente) para a cidade de Itanhomi/MG. Este sistema deve atender 100% dos requisitos legais definidos na Lei Municipal 1.234/2002, Lei de Acesso à Informação (LAI), LGPD e normas do TCE-MG.

## Situação Atual

O sistema já possui:
- ✅ **Base técnica sólida**: React + TypeScript + Supabase + Tailwind CSS
- ✅ **Autenticação completa**: com roles (admin, secretário, presidente, conselheiros)
- ✅ **5 módulos parciais**: Reuniões, Processos, FMA, Ouvidoria, Documentos
- ✅ **Estrutura de navegação**: sidebar com controle de acesso por role
- ✅ **Componentes UI**: shadcn/ui completamente configurado

## Prioridades de Desenvolvimento

### 🚨 CRÍTICA - Compliance Legal Imediata
1. **Módulo Conselheiros**: Cadastro completo com mandatos, faltas, impedimentos
2. **Logs de Auditoria**: Rastreabilidade total para TCE-MG
3. **Numeração Automática**: Processos, resoluções, protocolos únicos
4. **Sistema de Convocações**: Automatizado com confirmação de presença
5. **Atas Eletrônicas**: Com assinatura digital

### 🔴 ALTA - Funcionalidades Core
1. **Portal Transparência**: Página pública com todos os dados
2. **Controle de Resoluções**: Votação nominal e publicação
3. **Melhorias nos Processos**: Alertas de prazo e tramitação
4. **Aprimoramento FMA**: Relatórios automáticos para TCE-MG
5. **Painel de Indicadores**: KPIs e métricas legais

## Padrões Técnicos Obrigatórios

### Estrutura de Arquivos
```
src/
├── pages/
│   ├── codema/
│   │   ├── conselheiros/
│   │   │   ├── index.tsx (listagem)
│   │   │   ├── [id].tsx (detalhes)
│   │   │   └── novo.tsx (formulário)
│   │   ├── resolucoes/
│   │   └── transparencia/
│   └── [módulos existentes...]
├── components/
│   ├── codema/
│   │   ├── ConselheirosTable.tsx
│   │   ├── MandatoAlert.tsx
│   │   └── ...
│   └── ui/ (existente)
└── hooks/
    ├── codema/
    │   ├── useConselheiros.ts
    │   └── useResolucoes.ts
    └── [hooks existentes...]
```

### Padrões de Código
```typescript
// 1. Hooks seguindo padrão React Query
export function useConselheiros() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['conselheiros'],
    queryFn: fetchConselheiros
  });
  
  return { conselheiros: data, error, isLoading };
}

// 2. Formulários com react-hook-form + zod
const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  mandato_inicio: z.date(),
  entidade_representada: z.string().min(1, "Entidade é obrigatória")
});

// 3. Componentes com shadcn/ui
export function ConselheirosForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });
  
  return (
    <Form {...form}>
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Conselheiro</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Campos do formulário */}
        </CardContent>
      </Card>
    </Form>
  );
}
```

### Integração com Sistema Existente
```typescript
// Adicionar ao AppSidebar.tsx
const codemaItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Conselheiros", url: "/codema/conselheiros", icon: Users },
  { title: "Reuniões", url: "/reunioes", icon: Users },
  { title: "Resoluções", url: "/codema/resolucoes", icon: FileText },
  // ... outros itens existentes
];

// Adicionar rotas no App.tsx
<Route path="/codema/conselheiros" element={<ConselheirosIndex />} />
<Route path="/codema/conselheiros/novo" element={<ConselheirosNovo />} />
<Route path="/codema/conselheiros/:id" element={<ConselheirosDetalhes />} />
```

## Especificações Técnicas

### Database Schema (Supabase)
```sql
-- Tabela conselheiros
CREATE TABLE conselheiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mandato_inicio DATE NOT NULL,
  mandato_fim DATE NOT NULL,
  entidade_representada VARCHAR(255) NOT NULL,
  segmento VARCHAR(100) NOT NULL, -- titular, suplente
  categoria VARCHAR(100) NOT NULL, -- poder_publico, sociedade_civil, etc
  situacao VARCHAR(50) DEFAULT 'ativo',
  faltas_consecutivas INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Logs de auditoria
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Middleware de Auditoria
```typescript
// utils/auditLogger.ts
export async function logAction(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
  entity: string,
  entityId: string,
  oldValue?: any,
  newValue?: any
) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: window.location.hostname,
      user_agent: navigator.userAgent
    });
    
  if (error) console.error('Erro ao registrar log:', error);
}
```

## Instruções de Implementação

### 1. Quick Wins (Implementar Primeiro)
```typescript
// Numeração automática
export function gerarNumeroProcesso(tipo: 'PROC' | 'RES' | 'OUV'): string {
  const ano = new Date().getFullYear();
  const sequencial = await getProximoSequencial(tipo, ano);
  return `${tipo}-${sequencial.toString().padStart(3, '0')}/${ano}`;
}

// Contador de quórum
export function calcularQuorum(conselheiros: Conselheiro[], presentes: string[]): {
  total: number;
  presentes: number;
  necessario: number;
  atingido: boolean;
} {
  const ativos = conselheiros.filter(c => c.situacao === 'ativo');
  const necessario = Math.floor(ativos.length / 2) + 1;
  
  return {
    total: ativos.length,
    presentes: presentes.length,
    necessario,
    atingido: presentes.length >= necessario
  };
}
```

### 2. Integração com Módulos Existentes
- **Reuniões**: Adicionar controle de quórum e convocações
- **Processos**: Implementar numeração automática e alertas
- **FMA**: Adicionar relatórios automáticos
- **Ouvidoria**: Implementar protocolo único
- **Documentos**: Melhorar categorização e busca

### 3. Novos Módulos Críticos
1. **Conselheiros**: CRUD completo + alertas de mandato
2. **Resoluções**: Sistema de votação + publicação
3. **Transparência**: Portal público + e-SIC
4. **Atas**: Editor eletrônico + assinatura

## Regras de Negócio

### Conselheiros
- Mandato de 2 anos renovável
- Alerta 30 dias antes do vencimento
- Após 3 faltas consecutivas: notificação automática
- Impedimento impede participação em votações

### Reuniões
- Convocação ordinária: 7 dias antecedência
- Convocação extraordinária: 48h antecedência
- Quórum: maioria absoluta dos conselheiros ativos
- Ata deve ser publicada em até 48h

### Processos
- Prazo máximo: 30 dias para primeira análise
- Numeração única: PROC-001/2024
- Alerta aos 25 dias sem movimentação
- Tramitação rastreável

### Auditoria
- Todas as ações devem ser logadas
- Retenção: 5 anos (TCE-MG)
- Logs imutáveis após criação
- Acesso restrito a administradores

## Dependências Necessárias

```json
{
  "dependencies": {
    "@react-pdf/renderer": "^3.1.14",
    "@sendgrid/mail": "^7.7.0",
    "date-fns": "^3.6.0",
    "node-cron": "^3.0.3"
  }
}
```

## Checklist de Implementação

Para cada nova funcionalidade:
- [ ] Seguir padrões técnicos estabelecidos
- [ ] Implementar logs de auditoria
- [ ] Criar testes unitários
- [ ] Validar compliance legal
- [ ] Documentar decisões técnicas
- [ ] Testar em mobile (responsivo)
- [ ] Verificar permissões por role
- [ ] Fazer code review

## Comandos para Desenvolvimento

```bash
# Estrutura inicial
mkdir -p src/pages/codema/conselheiros
mkdir -p src/components/codema
mkdir -p src/hooks/codema

# Criar migration
npx supabase migration new add_conselheiros_tables

# Instalar dependências
npm install @react-pdf/renderer @sendgrid/mail

# Executar testes
npm run test

# Build e deploy
npm run build
```

## Diretrizes de UX/UI

1. **Manter consistência**: Use os mesmos componentes e estilos
2. **Foco na usabilidade**: Priorize clareza sobre estética
3. **Responsive**: Funcionar bem em mobile e desktop
4. **Acessibilidade**: Seguir padrões WCAG
5. **Performance**: Lazy loading e otimização
6. **Feedback**: Loading states e mensagens claras

## Importante: Regras de Comunicação

- **Sempre responda em português brasileiro**
- **Código deve ser em inglês** (variáveis, funções, comentários)
- **Comentários em português** quando necessário para explicar regras de negócio
- **Mensagens de erro em português** para o usuário final
- **Documentação em português**

## Próximos Passos Imediatos

1. **Implementar numeração automática** em processos existentes
2. **Criar módulo de conselheiros** completo
3. **Adicionar logs de auditoria** em todas as ações
4. **Melhorar sistema de reuniões** com quórum
5. **Desenvolver portal de transparência**

---

**Lembre-se**: O foco é COMPLIANCE LEGAL primeiro, funcionalidades adicionais depois! Toda implementação deve ser incremental e manter a compatibilidade com o sistema existente. 