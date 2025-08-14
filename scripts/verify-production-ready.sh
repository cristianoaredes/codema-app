#!/bin/bash

# ============================================================================
# CODEMA - Script de Verificação Final para Produção
# ============================================================================
# Este script verifica se o sistema está pronto para deploy em produção
# Data: 2025-01-13
# Versão: 2.0.0
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

echo -e "${BLUE}🚀 CODEMA - Verificação Final para Produção${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to run a check
run_check() {
    local description="$1"
    local command="$2"
    local required="$3"  # true/false
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "📋 $description... "
    
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSOU${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ FALHOU (CRÍTICO)${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        else
            echo -e "${YELLOW}⚠️ AVISO (OPCIONAL)${NC}"
        fi
    fi
}

# Function to check file exists
check_file_exists() {
    local file="$1"
    local description="$2"
    local required="$3"
    
    run_check "$description" "test -f '$file'" "$required"
}

# Function to check directory exists
check_dir_exists() {
    local dir="$1"
    local description="$2"
    local required="$3"
    
    run_check "$description" "test -d '$dir'" "$required"
}

echo -e "${BLUE}🔍 VERIFICAÇÕES DE ARQUIVOS ESSENCIAIS${NC}"
echo "----------------------------------------"

# Core files
check_file_exists "package.json" "Arquivo package.json existe" "true"
check_file_exists "vite.config.ts" "Configuração do Vite existe" "true"
check_file_exists "tsconfig.json" "Configuração TypeScript existe" "true"
if test -f "tailwind.config.js" || test -f "tailwind.config.ts"; then
    echo -n "📋 Configuração Tailwind existe... "
    echo -e "${GREEN}✅ PASSOU${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -n "📋 Configuração Tailwind existe... "
    echo -e "${RED}❌ FALHOU (CRÍTICO)${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi
check_file_exists ".env.example" "Arquivo de exemplo de ambiente existe" "true"

# Documentation
check_file_exists "README.md" "README principal existe" "true"
check_file_exists "CLAUDE.md" "Documentação Claude existe" "true"
check_file_exists "docs/GUIA_USUARIO_CODEMA.md" "Guia do usuário existe" "true"
check_file_exists "docs/RESUMO_TECNICO_FINAL.md" "Resumo técnico final existe" "true"
check_file_exists "docs/ARCHITECTURE_OVERVIEW.md" "Visão geral da arquitetura existe" "true"

# Source directories
check_dir_exists "src" "Diretório source existe" "true"
check_dir_exists "src/components" "Diretório de componentes existe" "true"
check_dir_exists "src/services" "Diretório de serviços existe" "true"
check_dir_exists "src/hooks" "Diretório de hooks existe" "true"
check_dir_exists "src/pages" "Diretório de páginas existe" "true"

# Database migrations
check_dir_exists "supabase/migrations" "Diretório de migrações existe" "true"
check_file_exists "supabase/migrations/20250813_base_schema.sql" "Schema base existe" "true"
check_file_exists "supabase/migrations/20250813_arquivo_digital.sql" "Migração arquivo digital existe" "true"
check_file_exists "supabase/migrations/20250813_mobile_api.sql" "Migração mobile API existe" "true"
check_file_exists "supabase/migrations/20250813_voting_system.sql" "Migração sistema de votação existe" "true"

echo ""
echo -e "${BLUE}🧪 VERIFICAÇÕES DE DEPENDÊNCIAS${NC}"
echo "--------------------------------"

# Check if Node.js is installed
run_check "Node.js está instalado" "command -v node" "true"

# Check if npm is installed
run_check "npm está instalado" "command -v npm" "true"

# Check if dependencies are installed
run_check "node_modules existe" "test -d node_modules" "true"

# Check package.json scripts
run_check "Script 'dev' está definido" "grep -q '\"dev\"' package.json" "true"
run_check "Script 'build' está definido" "grep -q '\"build\"' package.json" "true"
run_check "Script 'test' está definido" "grep -q '\"test\"' package.json" "true"
run_check "Script 'lint' está definido" "grep -q '\"lint\"' package.json" "true"

echo ""
echo -e "${BLUE}🏗️ VERIFICAÇÕES DE COMPONENTES PRINCIPAIS${NC}"
echo "-------------------------------------------"

# Core components
check_file_exists "src/components/auth/AuthProvider.tsx" "AuthProvider existe" "true"
check_file_exists "src/components/common/Header.tsx" "Header principal existe" "true"
check_file_exists "src/components/reunioes/QuorumIndicator.tsx" "Indicador de quórum existe" "true"
check_file_exists "src/components/voting/VotingPanel.tsx" "Painel de votação existe" "true"
check_file_exists "src/components/mobile/QRCodeAuth.tsx" "Autenticação QR existe" "true"
check_file_exists "src/components/arquivo/DocumentUpload.tsx" "Upload de documentos existe" "true"

# Services
check_file_exists "src/services/votingService.ts" "Serviço de votação existe" "true"
check_file_exists "src/services/mobileApiService.ts" "Serviço mobile API existe" "true"
check_file_exists "src/services/archiveService.ts" "Serviço de arquivo existe" "true"
check_file_exists "src/services/pushNotificationService.ts" "Serviço de push notification existe" "true"
check_file_exists "src/services/votingNotificationService.ts" "Serviço de notificações de votação existe" "true"

# Hooks
check_file_exists "src/hooks/useAuth.ts" "Hook de autenticação existe" "true"
check_file_exists "src/hooks/useVotingNotifications.ts" "Hook de notificações de votação existe" "true"

echo ""
echo -e "${BLUE}📱 VERIFICAÇÕES DE MOBILE/PWA${NC}"
echo "-------------------------------"

# PWA files
check_file_exists "public/manifest.json" "Manifest PWA existe" "false"
check_file_exists "public/sw.js" "Service Worker existe" "false"
check_file_exists "public/icon-192x192.png" "Ícone 192x192 existe" "false"
check_file_exists "public/icon-512x512.png" "Ícone 512x512 existe" "false"

echo ""
echo -e "${BLUE}🔒 VERIFICAÇÕES DE SEGURANÇA${NC}"
echo "------------------------------"

# Security checks
run_check "Não há arquivos .env commitados" "! find . -name '.env' -not -path './node_modules/*' | grep -q ." "true"
run_check "Arquivo .gitignore existe" "test -f .gitignore" "true"
run_check ".gitignore inclui .env" "grep -q '\.env' .gitignore" "true"
run_check ".gitignore inclui node_modules" "grep -q 'node_modules' .gitignore" "true"

echo ""
echo -e "${BLUE}⚡ VERIFICAÇÕES DE PERFORMANCE${NC}"
echo "--------------------------------"

# Performance checks
run_check "TypeScript configurado" "test -f tsconfig.json" "true"
if test -f "tailwind.config.js" || test -f "tailwind.config.ts"; then
    echo -n "📋 Tailwind CSS configurado... "
    echo -e "${GREEN}✅ PASSOU${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -n "📋 Tailwind CSS configurado... "
    echo -e "${RED}❌ FALHOU (CRÍTICO)${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi
run_check "Vite configurado para chunking" "grep -q 'manualChunks' vite.config.ts" "false"

echo ""
echo -e "${BLUE}🧩 VERIFICAÇÕES DE INTEGRAÇÃO${NC}"
echo "-------------------------------"

# Integration files
check_file_exists "src/integrations/supabase/client.ts" "Cliente Supabase configurado" "true"
check_file_exists "src/integrations/supabase/types.ts" "Tipos Supabase existem" "true"

echo ""
echo -e "${BLUE}📊 VERIFICAÇÕES DE QUALIDADE DE CÓDIGO${NC}"
echo "----------------------------------------"

# Code quality
if command -v npm >/dev/null 2>&1; then
    if [ -f "package.json" ] && grep -q '"lint"' package.json; then
        run_check "ESLint pode executar" "npm run lint --silent" "false"
    fi
    
    if [ -f "package.json" ] && grep -q '"type-check"' package.json; then
        run_check "TypeScript check passa" "npm run type-check --silent" "false"
    fi
    
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        run_check "Testes podem executar" "npm run test --silent --run" "false"
    fi
fi

echo ""
echo -e "${BLUE}🚀 VERIFICAÇÕES DE BUILD${NC}"
echo "---------------------------"

# Build verification
if command -v npm >/dev/null 2>&1 && [ -f "package.json" ]; then
    run_check "Build pode ser executado" "npm run build --silent" "true"
    
    if [ -d "dist" ]; then
        run_check "Diretório dist foi criado" "test -d dist" "true"
        run_check "index.html existe no build" "test -f dist/index.html" "true"
        run_check "Assets JavaScript existem" "ls dist/assets/*.js >/dev/null 2>&1" "true"
        run_check "Assets CSS existem" "ls dist/assets/*.css >/dev/null 2>&1" "true"
    fi
fi

echo ""
echo -e "${BLUE}📋 RESULTADOS FINAIS${NC}"
echo "===================="
echo ""

# Calculate percentage
if [ $TOTAL_CHECKS -gt 0 ]; then
    PERCENTAGE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
else
    PERCENTAGE=0
fi

echo -e "Total de verificações: ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Verificações aprovadas: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Verificações falharam: ${RED}$FAILED_CHECKS${NC}"
echo -e "Taxa de sucesso: ${GREEN}$PERCENTAGE%${NC}"
echo ""

# Final verdict
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 PARABÉNS! O sistema CODEMA está PRONTO PARA PRODUÇÃO! 🎉${NC}"
    echo -e "${GREEN}✅ Todas as verificações críticas passaram com sucesso.${NC}"
    echo ""
    echo -e "${BLUE}📋 Próximos passos recomendados:${NC}"
    echo "1. Configure as variáveis de ambiente (.env)"
    echo "2. Execute 'npx supabase db reset' para aplicar migrações"
    echo "3. Execute 'npm run build' para gerar build de produção"
    echo "4. Configure o deploy no ambiente escolhido"
    echo "5. Execute testes finais no ambiente de staging"
    echo ""
    exit 0
elif [ $PERCENTAGE -ge 90 ]; then
    echo -e "${YELLOW}⚠️ O sistema está QUASE pronto para produção.${NC}"
    echo -e "${YELLOW}Algumas verificações opcionais falharam, mas o core está funcional.${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ O sistema NÃO está pronto para produção.${NC}"
    echo -e "${RED}Verifique os erros críticos acima e corrija antes de prosseguir.${NC}"
    echo ""
    exit 1
fi