# CODEMA - Funcionalidades Urgentes para Presidente

## 🎯 **CONTEXTO**
Presidente CODEMA Itanhomi-MG (12k habitantes). Conselho 100% analógico e desorganizado. Precisa digitalizar URGENTE com foco em organização e transparência.

## 🚨 **IMPLEMENTAR HOJE (3 funcionalidades críticas)**

### **1. MÓDULO CONSELHEIROS COMPLETO (PRIORIDADE MÁXIMA)**

#### **Interface TypeScript**
```typescript
interface Conselheiro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  entidade_representada: string;
  segmento: 'governo' | 'sociedade_civil' | 'setor_produtivo';
  tipo: 'titular' | 'suplente';
  mandato_inicio: Date;
  mandato_fim: Date;
  situacao: 'ativo' | 'inativo' | 'suspenso' | 'vencido';
  faltas_consecutivas: number;
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### **Funcionalidades Obrigatórias**
- [ ] **CRUD completo** (criar, editar, listar, inativar)
- [ ] **Alerta automático** mandatos vencendo em 30 dias
- [ ] **Controle de faltas** consecutivas (máx 3)
- [ ] **Filtros** por segmento, situação, tipo
- [ ] **Validação CPF** e email únicos
- [ ] **Histórico de mandatos** anteriores
- [ ] **Exportação PDF** lista completa

#### **Regras de Negócio**
- Mandato padrão: 2 anos
- 3 faltas consecutivas = suspensão automática
- Presidente pode renovar mandatos
- Mínimo 1/3 sociedade civil

---

### **2. SISTEMA REUNIÕES INTELIGENTE**

#### **Interface TypeScript**
```typescript
interface Reuniao {
  id: string;
  numero: string; // REU-001/2024
  tipo: 'ordinaria' | 'extraordinaria';
  data_reuniao: Date;
  hora_inicio: string;
  local: string;
  pauta: string[];
  status: 'agendada' | 'realizada' | 'cancelada';
  ata_id?: string;
  quorum_minimo: number;
  presentes: PresencaReuniao[];
  created_at: Date;
}

interface PresencaReuniao {
  id: string;
  reuniao_id: string;
  conselheiro_id: string;
  presente: boolean;
  justificativa?: string;
  horario_chegada?: Date;
  horario_saida?: Date;
}
```

#### **Funcionalidades Obrigatórias**
- [ ] **Agendamento fácil** com template de pauta
- [ ] **Convocação automática** email/SMS (7 dias antes)
- [ ] **Confirmação de presença** pelos conselheiros
- [ ] **Cálculo automático de quórum** (maioria simples/absoluta)
- [ ] **Lista de presença** digital
- [ ] **Geração automática de atas**
- [ ] **Controle de faltas** por conselheiro

#### **Workflow Automático**
1. Presidente agenda reunião
2. Sistema gera convocações automáticas
3. Conselheiros confirmam presença
4. No dia: lista de presença digital
5. Pós-reunião: ata gerada automaticamente
6. Faltas registradas automaticamente

---

### **3. PROTOCOLO E NUMERAÇÃO AUTOMÁTICA**

#### **Sistema de Numeração**
```typescript
// Padrão: TIPO-NNN/AAAA
- PROC-001/2024 → Processos ambientais
- RES-001/2024 → Resoluções do conselho
- OUV-001/2024 → Denúncias ouvidoria
- REU-001/2024 → Reuniões
- ATA-001/2024 → Atas de reunião
- DOC-001/2024 → Documentos oficiais
```

#### **Implementar em**
- [ ] **Módulo Processos** → PROC-XXX/AAAA
- [ ] **Módulo Reuniões** → REU-XXX/AAAA
- [ ] **Módulo Ouvidoria** → OUV-XXX/AAAA
- [ ] **Futuras Resoluções** → RES-XXX/AAAA
- [ ] **Documentos** → DOC-XXX/AAAA

#### **Função Utilitária**
```typescript
export async function gerarNumeroProtocolo(
  tipo: 'PROC' | 'RES' | 'OUV' | 'REU' | 'ATA' | 'DOC',
  ano?: number
): Promise<string> {
  const anoAtual = ano || new Date().getFullYear();
  const proximoSequencial = await getProximoSequencial(tipo, anoAtual);
  return `${tipo}-${proximoSequencial.toString().padStart(3, '0')}/${anoAtual}`;
}
```

---

## 🎯 **RESULTADO ESPERADO APÓS IMPLEMENTAÇÃO**

### **PARA O PRESIDENTE (VOCÊ)**
- ✅ **Controle total** dos conselheiros e mandatos
- ✅ **Reuniões organizadas** com quórum garantido
- ✅ **Protocolo único** para todos os documentos
- ✅ **Alertas automáticos** de pendências
- ✅ **Histórico completo** de todas as ações
- ✅ **Relatórios instantâneos** para prefeitura

### **PARA O CONSELHO**
- ✅ **Organização profissional**
- ✅ **Transparência total**
- ✅ **Eficiência nas reuniões**
- ✅ **Rastreabilidade dos processos**
- ✅ **Conformidade legal 100%**

### **PARA A POPULAÇÃO**
- ✅ **Acesso fácil** às informações
- ✅ **Transparência real**
- ✅ **Acompanhamento** das decisões
- ✅ **Canal direto** de comunicação

---

## ⚡ **DESENVOLVIMENTO SUGERIDO**

### **Ordem de Implementação**
1. **DIA 1**: Módulo Conselheiros (base)
2. **DIA 2**: Sistema de reuniões (agendamento)
3. **DIA 3**: Protocolo automático
4. **DIA 4**: Integração reuniões + conselheiros
5. **DIA 5**: Testes e ajustes

### **Tecnologias**
- **Frontend**: React + TypeScript + shadcn/ui (existente)
- **Backend**: Supabase (configurado)
- **Notificações**: Email/SMS API
- **PDF**: react-pdf ou puppeteer
- **Validações**: Zod (existente)

---

## 🚀 **COMANDOS PARA COMEÇAR AGORA**

```bash
# 1. Criar estrutura módulo conselheiros
mkdir -p src/pages/codema/conselheiros
mkdir -p src/components/codema/conselheiros
mkdir -p src/hooks/codema

# 2. Implementar interfaces
touch src/types/codema/conselheiro.ts
touch src/types/codema/reuniao.ts

# 3. Começar desenvolvimento
cd src/pages/codema/conselheiros
# Criar ConselheirosPage.tsx

# 4. Testar numeração
touch src/utils/protocoloGenerator.ts
```

---

## ✅ **VALIDAÇÃO FINAL**

### **Critérios de Sucesso**
- [ ] Presidente consegue gerenciar todos os conselheiros
- [ ] Alertas de mandatos funcionando
- [ ] Reuniões com quórum calculado automaticamente
- [ ] Todos documentos com protocolo único
- [ ] Sistema rodando sem bugs
- [ ] Performance < 2 segundos

### **Entrega**
**Sistema funcional em 5 dias** com as 3 funcionalidades críticas implementadas e testadas.

---

**🎯 META: Transformar CODEMA analógico em digital profissional em 1 semana!** 