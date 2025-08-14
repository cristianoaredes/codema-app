# 🚀 CODEMA - Guia Completo de Deployment

## Sistema de Gestão Municipal Ambiental - Implantação em Produção

**Versão:** 2.0.0  
**Data:** Janeiro de 2025  
**Status:** Pronto para Produção ✅

---

## 📋 Pré-requisitos

### 🔧 Ambiente de Desenvolvimento
- **Node.js:** 18.x ou superior
- **npm:** 8.x ou superior 
- **Git:** Para controle de versão
- **Docker:** (Opcional) Para containerização

### ☁️ Serviços Externos Necessários
- **Supabase:** Backend as a Service (PostgreSQL + Auth + Storage)
- **Vercel/Netlify:** Hosting para frontend (recomendado)
- **Resend:** Serviço de email (opcional)
- **Twilio:** Serviço de SMS (opcional)

---

## 🏗️ Configuração do Ambiente

### 1. Clone e Preparação
```bash
# Clone do repositório
git clone <url-do-repositorio>
cd codema-app

# Instalação de dependências
npm install

# Verificação do sistema
npm run build
./scripts/verify-production-ready.sh
```

### 2. Configuração do Supabase

#### 2.1 Criar Projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização e projeto
3. Anote as credenciais:
   - **Project URL:** `https://[project-id].supabase.co`
   - **Anon Key:** Chave pública para frontend
   - **Service Role Key:** Chave privada para operações admin

#### 2.2 Configurar Variáveis de Ambiente
```bash
# Copiar exemplo de configuração
cp .env.example .env

# Editar .env com suas credenciais
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

#### 2.3 Aplicar Migrações do Banco
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
npx supabase login

# Linkar projeto local
npx supabase link --project-ref seu-project-id

# Aplicar todas as migrações
npx supabase db push

# Verificar tipos TypeScript
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

### 3. Configuração Opcional de Notificações

#### 3.1 Email via Resend
```env
# Adicionar ao .env
RESEND_API_KEY=sua-chave-resend
RESEND_FROM_EMAIL=noreply@seudominio.com
```

#### 3.2 SMS via Twilio
```env
# Adicionar ao .env
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_PHONE_NUMBER=+5511999999999
```

#### 3.3 Push Notifications
```env
# Adicionar ao .env para PWA
VITE_VAPID_PUBLIC_KEY=sua-chave-vapid-publica
VAPID_PRIVATE_KEY=sua-chave-vapid-privada
```

---

## 🚢 Deployment em Produção

### Opção 1: Vercel (Recomendado)

#### 1.1 Via Dashboard Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente
4. Deploy automático

#### 1.2 Via CLI Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar domínio personalizado (opcional)
vercel domains add seudominio.com.br
```

#### 1.3 Configuração Vercel
```json
// vercel.json
{
  "build": {
    "env": {
      "VITE_SUPABASE_URL": "@supabase-url",
      "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  }
}
```

### Opção 2: Netlify

#### 2.1 Via Dashboard Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Conecte repositório
3. Configure build:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Configure variáveis de ambiente

#### 2.2 Via CLI Netlify
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Opção 3: Docker + VPS

#### 3.1 Build Docker
```bash
# Build da imagem
docker build -t codema-app .

# Executar container
docker run -d \
  --name codema-app \
  -p 80:80 \
  -e VITE_SUPABASE_URL=sua-url \
  -e VITE_SUPABASE_ANON_KEY=sua-chave \
  codema-app
```

#### 3.2 Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    volumes:
      - ./certs:/etc/nginx/certs
    restart: unless-stopped
```

```bash
# Deploy com Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Configuração de Segurança

### 1. SSL/TLS
```bash
# Vercel/Netlify: SSL automático

# Docker + Nginx: Configurar Let's Encrypt
certbot --nginx -d seudominio.com.br
```

### 2. Supabase Security
```sql
-- Configurar RLS (já incluído nas migrações)
-- Verificar políticas de segurança:
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Headers de Segurança
```nginx
# nginx.conf (incluído no Docker)
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubdomains" always;
```

---

## 🧪 Validação do Deployment

### 1. Testes Automáticos
```bash
# Executar suite de testes
npm run test

# Build de produção
npm run build

# Verificação completa
./scripts/verify-production-ready.sh
```

### 2. Checklist Manual
- [ ] ✅ Login com Magic Link funcionando
- [ ] ✅ Criação de reuniões
- [ ] ✅ Controle de presença
- [ ] ✅ Geração de atas
- [ ] ✅ Sistema de votação
- [ ] ✅ Dashboard de métricas
- [ ] ✅ Upload de documentos
- [ ] ✅ Notificações (email/SMS se configurado)
- [ ] ✅ Responsividade mobile
- [ ] ✅ PWA instalável

### 3. Performance
```bash
# Lighthouse CLI (opcional)
npm install -g lighthouse
lighthouse https://seudominio.com.br --output=html --output-path=./lighthouse-report.html
```

**Métricas esperadas:**
- **Performance:** 90+ 
- **Accessibility:** 95+
- **Best Practices:** 90+
- **SEO:** 85+

---

## 📊 Monitoramento

### 1. Supabase Dashboard
- Monitor de queries
- Logs de erro
- Métricas de uso
- Backups automáticos

### 2. Vercel Analytics
```bash
# Instalar Vercel Analytics
npm install @vercel/analytics

# Adicionar ao App.tsx (já incluído)
import { Analytics } from '@vercel/analytics/react'
```

### 3. Logs de Aplicação
```typescript
// Configuração de logs (já incluída)
import { logger } from '@/utils/logger'

logger.info('Sistema iniciado', { userId, action })
logger.error('Erro na operação', { error, context })
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Recomendado)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🆘 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão Supabase
```bash
# Verificar URLs e chaves
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Testar conexão
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
     "$VITE_SUPABASE_URL/rest/v1/"
```

#### 2. Build Failing
```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build

# Verificar dependências
npm audit fix
```

#### 3. Migrações Falhando
```bash
# Reset completo do banco (CUIDADO!)
npx supabase db reset

# Aplicar migrações individuais
npx supabase migration repair 20250813_base_schema
```

#### 4. Performance Issues
```bash
# Análise de bundle
npm install -g webpack-bundle-analyzer
npx vite-bundle-analyzer

# Otimizar chunks
# Verificar vite.config.ts -> build.rollupOptions.output.manualChunks
```

---

## 📞 Suporte

### Documentação
- **Técnica:** `/docs/RESUMO_TECNICO_FINAL.md`
- **Usuário:** `/docs/GUIA_USUARIO_CODEMA.md`
- **Arquitetura:** `/docs/ARCHITECTURE_OVERVIEW.md`

### Contatos
- **GitHub Issues:** Para bugs e melhorias
- **Email:** Para suporte corporativo  
- **Chat:** Para emergências em produção

---

## 📈 Roadmap Pós-Deploy

### Melhorias Futuras
- [ ] **Analytics Avançados** - Google Analytics 4
- [ ] **API Pública** - Para integrações externas
- [ ] **Multi-tenancy** - Suporte a múltiplos conselhos
- [ ] **AI/ML** - Sugestões automáticas
- [ ] **Blockchain** - Imutabilidade de documentos

### Manutenção Regular
- **Backups:** Verificar backup automático semanal
- **Updates:** Atualizar dependências mensalmente
- **Monitoring:** Revisar logs e métricas semanalmente
- **Security:** Audit de segurança trimestral

---

**🎉 SISTEMA CODEMA DEPLOYADO COM SUCESSO! 🎉**

*Para dúvidas ou suporte, consulte a documentação ou abra uma issue no repositório.*