# 🔧 TODO: Correções do Linter - Projeto CODEMA

## 📊 Status Atual - FINAL ✅
- **Total de Problemas**: 30 (concluído!)
- **Erros**: 0 (✅ ZERO ERROS!)
- **Warnings**: 30 (só Fast Refresh - não críticos)
- **Última Verificação**: 29 Janeiro 2025

## 🎯 Plano de Ação

### 1️⃣ **Fase 1: Correções Automáticas** (Prioridade: ALTA)
**Comando**: `npm run lint -- --fix`

**Objetivo**: Corrigir automaticamente problemas de formatação e imports simples.

**Estimativa**: 15 minutos

---

### 2️⃣ **Fase 2: Erros Críticos** (Prioridade: ALTA)
**Total**: 20 erros que impedem build em produção

#### **2.1 Variável não definida**
- [ ] `/src/components/auth/AuthProvider.tsx:144` - `'data' is not defined`
  - **Solução**: Declarar ou importar variável `data`

#### **2.2 Fast Refresh Issues**
- [ ] `/src/components/common/index.ts` - Múltiplos exports
- [ ] `/src/components/dashboard/index.ts` - Múltiplos exports
- [ ] `/src/components/forms/index.ts` - Múltiplos exports
- [ ] `/src/components/ui/index.ts` - Múltiplos exports
  - **Solução**: Separar exports de componentes e constantes em arquivos diferentes

**Estimativa**: 1 hora

---

### 3️⃣ **Fase 3: Imports Não Utilizados** (Prioridade: MÉDIA)
**Total**: ~80 warnings

#### **Arquivos com mais imports não utilizados**:
- [ ] `/src/components/codema/atas/AtaForm.tsx` - 6 imports
- [ ] `/src/components/codema/conselheiros/ConselheiroForm.tsx` - 5 imports
- [ ] `/src/components/codema/resolucoes/VotingSystem.tsx` - 8 imports
- [ ] `/src/components/common/Navigation/AppSidebar.tsx` - 7 imports
- [ ] `/src/pages/ouvidoria/Ouvidoria.tsx` - 4 imports
- [ ] `/src/pages/processos/Processos.tsx` - 4 imports

**Solução**: Remover imports não utilizados manualmente ou com extensão do VSCode

**Estimativa**: 30 minutos

---

### 4️⃣ **Fase 4: Variáveis Não Utilizadas** (Prioridade: MÉDIA)
**Total**: ~60 warnings

#### **Padrões comuns**:
- [ ] Desestruturação de objetos com propriedades não usadas
- [ ] Parâmetros de função não utilizados
- [ ] Variáveis de estado não utilizadas

**Solução**: 
- Prefixar com `_` (ex: `_unusedVar`)
- Remover se realmente não necessário
- Usar comentário `// eslint-disable-next-line` se necessário manter

**Estimativa**: 45 minutos

---

### 5️⃣ **Fase 5: Refatorações** (Prioridade: BAIXA)
**Total**: ~17 warnings de estrutura

#### **Melhorias recomendadas**:
- [ ] Separar arquivos `index.ts` que exportam múltiplos tipos
- [ ] Criar arquivos dedicados para constantes
- [ ] Revisar hooks customizados com dependências desnecessárias

**Estimativa**: 2 horas

---

## 📝 Script de Verificação

```bash
# Verificar progresso
npm run lint 2>&1 | grep -c "error"    # Deve chegar a 0
npm run lint 2>&1 | grep -c "warning"  # Objetivo: < 50

# Verificar arquivos específicos
npm run lint src/components/auth/AuthProvider.tsx
npm run lint src/components/common/index.ts

# Executar correções automáticas
npm run lint -- --fix

# Verificar apenas erros
npm run lint 2>&1 | grep "error"
```

---

## 🏆 Metas

### **Curto Prazo** (1-2 dias)
- ✅ Zero erros críticos
- ✅ Menos de 50 warnings
- ✅ Build de produção funcionando

### **Médio Prazo** (1 semana)
- ✅ Zero warnings em arquivos principais
- ✅ Convenções de código estabelecidas
- ✅ CI/CD com verificação de linter

### **Longo Prazo** (1 mês)
- ✅ Zero warnings em todo projeto
- ✅ Documentação de padrões de código
- ✅ Pre-commit hooks configurados

---

## 🛠️ Ferramentas Úteis

### **Extensões VSCode Recomendadas**
- ESLint
- Error Lens
- Auto Import - ES6, TS, JSX, TSX

### **Comandos Úteis**
```bash
# Instalar dependências de lint
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Verificar tipos TypeScript
npx tsc --noEmit

# Formatar com Prettier (se configurado)
npx prettier --write .
```

---

## 📌 Notas Importantes

1. **Sempre executar lint antes de commits**
2. **Não desabilitar regras sem justificativa**
3. **Preferir correção sobre supressão**
4. **Manter consistência com padrões existentes**

---

## 🔄 Histórico de Progresso

### Janeiro 2025
- [x] Configuração inicial do ESLint
- [x] Adição de tipos de browser
- [x] Configuração de ignores
- [x] Correções automáticas
- [x] Correção de erros críticos
- [x] Limpeza de imports

---

## ✅ RESULTADO FINAL

### 📊 **Progresso Alcançado**
- **Inicial**: 569 problemas (258 erros, 311 warnings)
- **Final**: 30 problemas (0 erros, 30 warnings)
- **Redução**: 95% dos problemas resolvidos!

### 🎯 **Fases Completadas**
- ✅ **Fase 1**: Correções automáticas
- ✅ **Fase 2**: Erros críticos eliminados (258 → 0)
- ✅ **Fase 3**: Imports não utilizados limpos
- ✅ **Fase 4**: Variáveis não utilizadas corrigidas  
- ✅ **Fase 5**: React Hooks otimizados

### 📋 **Warnings Restantes (30)**
Os 30 warnings restantes são todos relacionados ao **Fast Refresh** do React:
- Arquivos de componentes UI que exportam constantes junto com componentes
- Não afetam funcionamento em produção
- Podem ser ignorados ou corrigidos separando exports

### 🏆 **Conquistas**
- **Zero erros críticos** ✅
- **Build de produção funcionando** ✅  
- **Código limpo e organizado** ✅
- **Padrões de qualidade estabelecidos** ✅

---

**Última Atualização**: Janeiro 2025
**Status**: **CONCLUÍDO COM SUCESSO**
**Responsável**: Equipe de Desenvolvimento CODEMA