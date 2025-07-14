# CODEMA - Próximos Passos Imediatos

## 🎯 Priorização Baseada em Valor Legal e Esforço

### Matriz de Priorização

| Feature | Valor Legal | Esforço | Prioridade | Justificativa |
|---------|-------------|---------|------------|---------------|
| Numeração automática (Processos/Resoluções) | Alto | Baixo | 🔥 FAZER JÁ | Exigência legal, fácil implementar |
| Módulo Conselheiros | Alto | Médio | 🔥 FAZER JÁ | Lei 1.234/2002 art. 6º |
| Logs de Auditoria | Alto | Baixo | 🔥 FAZER JÁ | TCE-MG exige rastreabilidade |
| Sistema de Convocação | Alto | Médio | ⚡ PRÓXIMO | Lei exige 7 dias antecedência |
| Atas Eletrônicas | Alto | Alto | ⚡ PRÓXIMO | Complexo mas obrigatório |
| Portal Transparência | Alto | Médio | ⚡ PRÓXIMO | LAI - multas por não cumprimento |
| Melhorias FMA | Médio | Baixo | 📋 DEPOIS | Já funciona, só melhorar |
| App Mobile | Baixo | Alto | 🔵 FUTURO | Nice to have |

## 🚀 Sprint 1 (Esta Semana) - Quick Wins

### 1. Numeração Automática (1 dia)
```typescript
// utils/numeroProcesso.ts
export function gerarNumeroProcesso(tipo: string): string {
  const ano = new Date().getFullYear();
  const sequencial = await getProximoSequencial(tipo, ano);
  return `${tipo}-${sequencial.toString().padStart(3, '0')}/${ano}`;
}

// Aplicar em:
- Processos: PROC-001/2024
- Ouvidoria: OUV-001/2024  
- Resoluções: RES-001/2024
```

### 2. Sistema de Logs Básico (2 dias)
```typescript
// middleware/auditLog.ts
export async function logAction(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  oldValue?: any,
  newValue?: any
) {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    entity,
    entity_id: entityId,
    old_value: oldValue,
    new_value: newValue,
    ip_address: request.ip,
    user_agent: request.headers['user-agent']
  });
}
```

### 3. Contador de Quórum (1 dia)
```typescript
// components/QuorumIndicator.tsx
- Visual: 7/9 presentes ✅ (quórum atingido)
- Bloquear início se quórum não atingido
- Adicionar à página de reuniões existente
```

## 📅 Sprint 2 (Próximas 2 Semanas) - Módulo Conselheiros

### Semana 1: Backend + Estrutura
```bash
# 1. Migration
npx supabase migration new add_conselheiros_tables

# 2. Tipos
src/types/conselheiro.ts

# 3. API/Hooks  
src/hooks/useConselheiros.ts

# 4. Componentes base
src/components/codema/ConselheirosTable.tsx
src/components/codema/MandatoCard.tsx
```

### Semana 2: Frontend + Integração
```bash
# 1. Páginas
src/pages/codema/conselheiros/index.tsx
src/pages/codema/conselheiros/novo.tsx
src/pages/codema/conselheiros/[id].tsx

# 2. Integração com reuniões
- Validar quórum com conselheiros ativos
- Marcar presenças/faltas
- Alertas de 3 faltas consecutivas

# 3. Alertas de mandato
- Cron job diário
- Email 30 dias antes do vencimento
```

## 🔧 Setup Imediato Necessário

### 1. Variáveis de Ambiente
```env
# Adicionar ao .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_FROM=codema@itanhomi.mg.gov.br
AUDIT_RETENTION_YEARS=5
```

### 2. Novas Dependências (só as essenciais agora)
```bash
# Para PDF
npm install @react-pdf/renderer

# Para emails (escolher um)
npm install @sendgrid/mail
# ou
npm install nodemailer

# Para cron jobs
npm install node-cron
```

### 3. Criar Estrutura de Pastas
```bash
mkdir -p src/pages/codema/conselheiros
mkdir -p src/components/codema
mkdir -p src/hooks/codema
mkdir -p src/utils/codema
```

## 📊 KPIs para Medir Sucesso

### Sprint 1 (Quick Wins)
- [ ] 100% dos processos com número único
- [ ] 100% das ações logadas
- [ ] Quórum calculado automaticamente

### Sprint 2 (Conselheiros)  
- [ ] 100% dos conselheiros cadastrados
- [ ] Alertas de mandato funcionando
- [ ] Integração com presença em reuniões

### Sprint 3 (Convocações/Atas)
- [ ] 100% convocações enviadas no prazo
- [ ] 50% de redução no tempo de publicação de atas
- [ ] Zero reclamações sobre notificações

## ⚠️ Decisões Técnicas Importantes

### 1. Assinatura Digital
**Decisão**: Implementar assinatura simples primeiro, gov.br depois
```typescript
// Fase 1: Hash + confirmação por email
// Fase 2: Integração ICP-Brasil
```

### 2. Notificações
**Decisão**: Email primeiro, WhatsApp depois
```typescript
// Fase 1: Email com SendGrid
// Fase 2: WhatsApp Business API
```

### 3. Storage de Documentos
**Decisão**: Usar Supabase Storage existente
```typescript
// Já configurado, só organizar buckets
// /atas, /resolucoes, /processos
```

## 🏃‍♂️ Ações Imediatas (HOJE)

1. **Criar branch de feature**
   ```bash
   git checkout -b feature/codema-compliance
   ```

2. **Implementar numeração automática**
   - [ ] Criar função util
   - [ ] Adicionar às páginas existentes
   - [ ] Testar com dados reais

3. **Configurar estrutura de logs**
   - [ ] Criar tabela audit_logs
   - [ ] Criar middleware básico
   - [ ] Logar primeira ação

4. **Preparar ambiente**
   - [ ] Configurar email provider
   - [ ] Documentar decisões técnicas
   - [ ] Criar issues no GitHub

## 💡 Dicas para o Time

1. **Não reinventar a roda**: Use os componentes e padrões existentes
2. **Incremental sempre**: Deploy pequeno todo dia > deploy grande mensal  
3. **Testes desde o início**: Mais fácil manter do que adicionar depois
4. **Documentar decisões**: Futuro você agradecerá
5. **Feedback rápido**: Mostrar para usuários a cada sprint

## 📞 Pontos de Contato

- **Dúvidas Legais**: Procuradoria Municipal
- **Integração gov.br**: suporte@gov.br
- **Requisitos TCE-MG**: ouvidoria@tce.mg.gov.br
- **UX/Design**: Manter consistência com o existente

---

**Lembre-se**: O objetivo é compliance legal PRIMEIRO, features bonitas DEPOIS! 🎯