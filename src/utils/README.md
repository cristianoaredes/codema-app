# Utilitários - Organização

## 📁 Estrutura Atual vs Proposta

### **Atual (Plana)**
```
utils/
├── rememberMe.ts
├── systemInit.ts
├── metricsCollector.ts
├── retryUtils.ts
├── healthCheck.ts
├── debugMagicLink.ts
├── emailRateLimit.ts
├── forceUserRefresh.ts
├── updateUserRole.ts
├── protocoloGenerator.ts
├── emailValidation.ts
├── createTestAccounts.ts
├── sampleDataSeeder.ts
├── auditLogger.ts
└── numeroGenerator.ts
```

### **Proposta (Organizada)**
```
utils/
├── auth/
│   ├── rememberMe.ts
│   ├── debugMagicLink.ts
│   └── forceUserRefresh.ts
├── email/
│   ├── emailValidation.ts
│   └── emailRateLimit.ts
├── system/
│   ├── systemInit.ts
│   ├── healthCheck.ts
│   └── metricsCollector.ts
├── generators/
│   ├── protocoloGenerator.ts
│   ├── numeroGenerator.ts
│   └── createTestAccounts.ts
├── data/
│   └── sampleDataSeeder.ts
├── monitoring/
│   ├── auditLogger.ts
│   └── retryUtils.ts
└── user/
    └── updateUserRole.ts
```

## 🎯 Benefícios da Reorganização

1. **Facilita Encontrabilidade**: Agrupa por funcionalidade
2. **Reduz Imports**: Permite imports mais específicos
3. **Melhora Manutenção**: Código relacionado fica junto
4. **Facilita Testes**: Agrupa por domínio
5. **Prepara para Crescimento**: Estrutura escalável

## 📋 Plano de Implementação

### **Passo 1**: Criar diretórios
### **Passo 2**: Mover arquivos
### **Passo 3**: Atualizar imports
### **Passo 4**: Testar build
### **Passo 5**: Documentar mudanças 