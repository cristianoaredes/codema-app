# 📁 Reorganização do Projeto CODEMA

## 🎯 **Objetivos da Reorganização**

1. **Padronizar imports** para melhor manutenibilidade
2. **Reduzir duplicação** de imports
3. **Melhorar organização** por domínio
4. **Facilitar navegação** no código

## 📋 **Estrutura Atual vs Recomendada**

### **✅ Melhorias Implementadas**

#### **1. Hooks Consolidados** (`src/hooks/index.ts`)
```typescript
// ✅ RECOMENDADO - Import consolidado
import { useAuth, useToast, useConselheiros } from '@/hooks';

// ❌ EVITAR - Imports individuais
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
```

#### **2. Types Consolidados** (`src/types/index.ts`)
```typescript
// ✅ RECOMENDADO - Import consolidado
import { Conselheiro, Reuniao, Profile } from '@/types';

// ❌ EVITAR - Imports individuais
import { Conselheiro } from '@/types/conselheiro';
import { Reuniao } from '@/types/reuniao';
```

#### **3. UI Components Consolidados** (`src/components/ui/index.ts`)
```typescript
// ✅ RECOMENDADO - Import consolidado
import { Button, Card, Input, Badge } from '@/components/ui';

// ❌ EVITAR - Imports individuais
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

### **🔄 Próximos Passos Recomendados**

#### **1. Padronizar Imports em Páginas**
```typescript
// ✅ PADRÃO RECOMENDADO
import { useAuth, useToast } from '@/hooks';
import { Button, Card, Input } from '@/components/ui';
import { Conselheiro, Profile } from '@/types';
import { authService } from '@/services/auth';
```

#### **2. Organizar Services por Domínio**
```
src/services/
├── auth/
│   ├── AuthService.ts
│   └── index.ts
├── codema/
│   ├── ConselheiroService.ts
│   ├── ReuniaoService.ts
│   └── index.ts
├── email/
│   ├── EmailService.ts
│   └── index.ts
└── index.ts
```

#### **3. Consolidar Utils por Funcionalidade**
```
src/utils/
├── auth/          ✅ Já organizado
├── email/         ✅ Já organizado
├── system/        ✅ Já organizado
├── generators/    ✅ Já organizado
├── data/          ✅ Já organizado
├── monitoring/    ✅ Já organizado
└── user/          ✅ Já organizado
```

## 🛠️ **Scripts de Migração**

### **1. Migrar Imports de Hooks**
```bash
# Substituir imports individuais por consolidados
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/from '\''@\/hooks\/useAuth'\''/from '\''@\/hooks'\''/g' \
  -e 's/from '\''@\/hooks\/use-toast'\''/from '\''@\/hooks'\''/g'
```

### **2. Migrar Imports de Types**
```bash
# Substituir imports individuais por consolidados
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/from '\''@\/types\/conselheiro'\''/from '\''@\/types'\''/g' \
  -e 's/from '\''@\/types\/auth'\''/from '\''@\/types'\''/g'
```

### **3. Migrar Imports de UI Components**
```bash
# Substituir imports individuais por consolidados
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/from '\''@\/components\/ui\/button'\''/from '\''@\/components\/ui'\''/g' \
  -e 's/from '\''@\/components\/ui\/card'\''/from '\''@\/components\/ui'\''/g'
```

## 📊 **Benefícios Esperados**

### **1. Manutenibilidade**
- ✅ Imports mais limpos e consistentes
- ✅ Menos duplicação de código
- ✅ Fácil localização de dependências

### **2. Performance**
- ✅ Menos imports individuais
- ✅ Melhor tree-shaking
- ✅ Builds mais rápidos

### **3. Desenvolvimento**
- ✅ Autocomplete mais eficiente
- ✅ Menos erros de import
- ✅ Código mais legível

## 🎯 **Checklist de Implementação**

- [x] Consolidar exports de hooks
- [x] Consolidar exports de types
- [x] Consolidar exports de UI components
- [ ] Migrar imports em páginas principais
- [ ] Migrar imports em componentes
- [ ] Migrar imports em hooks
- [ ] Migrar imports em services
- [ ] Testar build e funcionalidade
- [ ] Documentar padrões para equipe

## 📝 **Padrões de Import Recomendados**

### **Hooks**
```typescript
// ✅ RECOMENDADO
import { useAuth, useToast, useConselheiros } from '@/hooks';

// ❌ EVITAR
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
```

### **Types**
```typescript
// ✅ RECOMENDADO
import { Conselheiro, Profile, UserRole } from '@/types';

// ❌ EVITAR
import { Conselheiro } from '@/types/conselheiro';
import { Profile } from '@/types/auth';
```

### **UI Components**
```typescript
// ✅ RECOMENDADO
import { Button, Card, Input, Badge } from '@/components/ui';

// ❌ EVITAR
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

### **Services**
```typescript
// ✅ RECOMENDADO
import { authService } from '@/services/auth';
import { emailService } from '@/services/email';

// ❌ EVITAR
import { authService } from '@/services/auth/AuthService';
```

### **Utils**
```typescript
// ✅ RECOMENDADO
import { cn, formatDate } from '@/utils';
import { createPersistentSession } from '@/utils/auth';

// ❌ EVITAR
import { cn } from '@/lib/utils';
import { createPersistentSession } from '@/utils/auth/rememberMe';
```

## 🚀 **Próximos Passos**

1. **Implementar migração gradual** dos imports
2. **Testar cada mudança** para garantir funcionalidade
3. **Documentar padrões** para a equipe
4. **Configurar linting** para manter consistência
5. **Criar templates** para novos arquivos 