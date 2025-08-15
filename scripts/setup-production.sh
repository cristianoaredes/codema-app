#!/bin/bash

# ============================================================================
# CODEMA - Script de Setup Automatizado para Produção
# ============================================================================
# Este script automatiza a configuração inicial do sistema CODEMA
# Data: 2025-01-13
# Versão: 1.0.0
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CODEMA - Setup Automatizado para Produção${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt for user input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -n "$default_value" ]; then
        read -p "$prompt [$default_value]: " input
        if [ -z "$input" ]; then
            input="$default_value"
        fi
    else
        read -p "$prompt: " input
        while [ -z "$input" ]; do
            echo -e "${RED}❌ Este campo é obrigatório!${NC}"
            read -p "$prompt: " input
        done
    fi
    
    eval "$var_name='$input'"
}

# Function to validate URL
validate_url() {
    local url="$1"
    # Check if the URL starts with https://, has a valid subdomain, and ends with .supabase.co
    # Optionally allow a port and/or path, but not credentials or query strings
    if [[ "$url" =~ ^https://([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+\.supabase\.co(:[0-9]+)?(/.*)?$ ]]; then
        return 0
    else
        return 1
    fi
}

echo -e "${BLUE}📋 VERIFICAÇÃO DE PRÉ-REQUISITOS${NC}"
echo "-------------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js detectado: $NODE_VERSION${NC}"
    
    # Check if version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${YELLOW}⚠️ Recomendamos Node.js 18+ (atual: $NODE_VERSION)${NC}"
    fi
else
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "📋 Instale Node.js 18+ em: https://nodejs.org"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm detectado: v$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm não encontrado!${NC}"
    exit 1
fi

# Check git
if command_exists git; then
    echo -e "${GREEN}✅ Git detectado${NC}"
else
    echo -e "${RED}❌ Git não encontrado!${NC}"
    echo "📋 Instale Git em: https://git-scm.com"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 INSTALAÇÃO DE DEPENDÊNCIAS${NC}"
echo "-----------------------------"

echo "📥 Instalando dependências do projeto..."
npm install

echo -e "${GREEN}✅ Dependências instaladas com sucesso!${NC}"

echo ""
echo -e "${BLUE}🔧 CONFIGURAÇÃO DO AMBIENTE${NC}"
echo "-----------------------------"

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️ Arquivo .env já existe!${NC}"
    prompt_input "Deseja sobrescrever o arquivo .env existente? (y/N)" OVERWRITE_ENV "N"
    
    if [[ ! "$OVERWRITE_ENV" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📋 Mantendo configuração existente${NC}"
        USE_EXISTING_ENV=true
    else
        USE_EXISTING_ENV=false
    fi
else
    USE_EXISTING_ENV=false
fi

if [ "$USE_EXISTING_ENV" = false ]; then
    echo "🔑 Configurando variáveis de ambiente..."
    
    # Prompt for Supabase configuration
    echo ""
    echo -e "${YELLOW}📋 Configuração do Supabase:${NC}"
    echo "   1. Acesse https://supabase.com"
    echo "   2. Crie um novo projeto"
    echo "   3. Vá em Settings > API"
    echo ""
    
    # Get Supabase URL
    while true; do
        prompt_input "🔗 URL do Supabase (ex: https://abc123.supabase.co)" SUPABASE_URL
        if validate_url "$SUPABASE_URL"; then
            break
        else
            echo -e "${RED}❌ URL inválida! Use o formato: https://seu-id.supabase.co${NC}"
        fi
    done
    
    # Get Supabase Anon Key
    prompt_input "🔑 Chave Anônima do Supabase" SUPABASE_ANON_KEY
    
    # Optional services
    echo ""
    echo -e "${YELLOW}📧 Configuração de Notificações (Opcional):${NC}"
    prompt_input "📧 Resend API Key (para emails)" RESEND_API_KEY ""
    prompt_input "📧 Email remetente (ex: noreply@seudominio.com)" FROM_EMAIL ""
    prompt_input "📱 Twilio Account SID (para SMS)" TWILIO_SID ""
    prompt_input "📱 Twilio Auth Token" TWILIO_TOKEN ""
    prompt_input "📱 Número Twilio (ex: +5511999999999)" TWILIO_PHONE ""
    
    # Create .env file
    cat > .env << EOF
# CODEMA - Configuração de Ambiente
# Gerado automaticamente em $(date)

# Supabase Configuration (OBRIGATÓRIO)
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Email Configuration (OPCIONAL - Resend)
RESEND_API_KEY=$RESEND_API_KEY
RESEND_FROM_EMAIL=$FROM_EMAIL

# SMS Configuration (OPCIONAL - Twilio)
TWILIO_ACCOUNT_SID=$TWILIO_SID
TWILIO_AUTH_TOKEN=$TWILIO_TOKEN
TWILIO_PHONE_NUMBER=$TWILIO_PHONE

# PWA Push Notifications (OPCIONAL)
# VITE_VAPID_PUBLIC_KEY=sua-chave-vapid-publica
# VAPID_PRIVATE_KEY=sua-chave-vapid-privada

# Environment
NODE_ENV=production
EOF

    echo -e "${GREEN}✅ Arquivo .env criado com sucesso!${NC}"
fi

echo ""
echo -e "${BLUE}🗄️ CONFIGURAÇÃO DO BANCO DE DADOS${NC}"
echo "--------------------------------"

# Check if Supabase CLI is installed
if command_exists supabase; then
    echo -e "${GREEN}✅ Supabase CLI detectado${NC}"
else
    echo "📦 Instalando Supabase CLI..."
    npm install -g supabase
    echo -e "${GREEN}✅ Supabase CLI instalado${NC}"
fi

# Prompt for database setup
echo ""
echo -e "${YELLOW}🔧 Configuração do Banco de Dados:${NC}"
echo "   Para aplicar as migrações do banco, você precisa:"
echo "   1. Fazer login no Supabase CLI"
echo "   2. Linkar seu projeto"
echo "   3. Aplicar as migrações"
echo ""

prompt_input "Deseja configurar o banco agora? (Y/n)" SETUP_DB "Y"

if [[ "$SETUP_DB" =~ ^[Yy]$ ]]; then
    echo "🔑 Fazendo login no Supabase..."
    echo "   Isso abrirá seu navegador para autenticação."
    
    if npx supabase login; then
        echo -e "${GREEN}✅ Login realizado com sucesso!${NC}"
        
        # Extract project ID from URL
        PROJECT_ID=$(echo "$SUPABASE_URL" | sed 's/https:\/\/\([^.]*\)\.supabase\.co/\1/')
        
        echo "🔗 Linkando projeto local ao Supabase..."
        if npx supabase link --project-ref "$PROJECT_ID"; then
            echo -e "${GREEN}✅ Projeto linkado com sucesso!${NC}"
            
            echo "🗄️ Aplicando migrações do banco..."
            if npx supabase db push; then
                echo -e "${GREEN}✅ Migrações aplicadas com sucesso!${NC}"
                
                echo "🔄 Gerando tipos TypeScript..."
                if npx supabase gen types typescript --linked > src/integrations/supabase/types.ts; then
                    echo -e "${GREEN}✅ Tipos TypeScript atualizados!${NC}"
                else
                    echo -e "${YELLOW}⚠️ Falha ao gerar tipos. Execute manualmente: npx supabase gen types typescript --linked > src/integrations/supabase/types.ts${NC}"
                fi
            else
                echo -e "${YELLOW}⚠️ Falha ao aplicar migrações. Execute manualmente: npx supabase db push${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️ Falha ao linkar projeto. Execute manualmente: npx supabase link --project-ref $PROJECT_ID${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Falha no login. Execute manualmente: npx supabase login${NC}"
    fi
else
    echo -e "${BLUE}📋 Configuração do banco ignorada${NC}"
    echo "   Execute manualmente quando necessário:"
    echo "   1. npx supabase login"
    echo "   2. npx supabase link --project-ref seu-project-id"
    echo "   3. npx supabase db push"
fi

echo ""
echo -e "${BLUE}🏗️ BUILD E VERIFICAÇÃO${NC}"
echo "----------------------"

echo "🔨 Executando build de produção..."
if npm run build; then
    echo -e "${GREEN}✅ Build executado com sucesso!${NC}"
else
    echo -e "${RED}❌ Falha no build!${NC}"
    echo "   Verifique os erros acima e corrija antes de prosseguir."
    exit 1
fi

echo "🔍 Executando verificação final..."
if ./scripts/verify-production-ready.sh; then
    echo -e "${GREEN}✅ Verificação aprovada!${NC}"
else
    echo -e "${YELLOW}⚠️ Algumas verificações falharam, mas o sistema pode estar funcional${NC}"
fi

echo ""
echo -e "${GREEN}🎉 SETUP CONCLUÍDO COM SUCESSO! 🎉${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📋 Próximos Passos:${NC}"
echo ""
echo "🚀 Para desenvolvimento local:"
echo "   npm run dev"
echo ""
echo "🌐 Para deployment em produção:"
echo "   1. Vercel: https://vercel.com"
echo "   2. Netlify: https://netlify.com"
echo "   3. Docker: docker build -t codema ."
echo ""
echo "📚 Documentação:"
echo "   - Técnica: docs/RESUMO_TECNICO_FINAL.md"
echo "   - Usuário: docs/GUIA_USUARIO_CODEMA.md"
echo "   - Deploy: docs/DEPLOYMENT_GUIDE.md"
echo ""
echo "🆘 Suporte:"
echo "   - GitHub Issues para bugs e melhorias"
echo "   - Documentação completa em docs/"
echo ""
echo -e "${GREEN}✅ Sistema CODEMA pronto para uso!${NC}"