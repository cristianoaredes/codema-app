# TODO (80/20) – CODEMA

## Prioridades Altas
- [x] Consolidar autenticação e perfis essenciais (admin, membro, leitura)
- [x] CRUD conselheiros estável (validações, erros, UX)
- [x] Fluxo de reuniões (criação, convocação, presenças) funcionando ponta a ponta
- [x] Atas: criação → revisão → aprovação (estado claro)
- [x] Resoluções: criação → publicação (status, histórico)
- [x] Auditoria mínima: registrar ações-chave

## Médias
- [x] Padronizar feedback de erro/carregamento (componente único)
- [x] Centralizar schemas Zod de cada domínio
- [x] Limpar utilitários/serviços não usados
- [x] Políticas Supabase: apenas o necessário no início

## Baixas  
- [ ] Ouvidoria fase 2 (se não obrigatório agora)
- [x] FMA fase 2 ✅ CONCLUÍDO (sistema completo implementado)
- [ ] Dashboards avançados

## Infra/DevEx
- [x] CI: testes, lint, build
- [x] Docker: compose dev e imagem prod enxuta
- [x] Varredura de segurança da imagem
  - Removidos serviços opcionais do compose (adminer/pgadmin/mailhog)
  - Mantidos apenas app e postgres; compose validado e stack ativa
  - Build e up concluídos com sucesso

## Documentação
- [x] Atualizar `README` com escopo 80/20
- [x] Manter `docs/ARCHITECTURE_OVERVIEW.md` alinhado a cada entrega ✅ ATUALIZADO (Janeiro 2025)
