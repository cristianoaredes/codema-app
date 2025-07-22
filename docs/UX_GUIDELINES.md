# Diretrizes de UX - Sistema CODEMA

## Visão Geral

Este documento estabelece as diretrizes de experiência do usuário (UX) para o sistema CODEMA, focando em usabilidade, acessibilidade e melhores práticas para sistemas governamentais.

## Princípios Fundamentais

### 1. Simplicidade e Clareza
- **Linguagem clara**: Use termos simples e evite jargões técnicos
- **Hierarquia visual**: Organize informações por ordem de importância
- **Navegação intuitiva**: Máximo de 7±2 itens por menu
- **Fluxos diretos**: Minimize cliques para tarefas comuns

### 2. Acessibilidade (WCAG 2.1 AA)
- **Contraste**: Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **Navegação por teclado**: Todos os elementos devem ser acessíveis via Tab
- **Screen readers**: Use ARIA labels e estrutura semântica
- **Foco visível**: Indicadores claros de foco para navegação

### 3. Responsividade
- **Mobile-first**: Design prioritário para dispositivos móveis
- **Breakpoints**: 768px (mobile), 1024px (tablet), 1280px (desktop)
- **Touch-friendly**: Elementos com mínimo 44px de área de toque
- **Adaptabilidade**: Layouts que se ajustam a diferentes tamanhos

## Componentes de Interface

### Sistema de Cores

```css
/* Cores primárias */
--primary: #2563eb;        /* Azul institucional */
--primary-foreground: #ffffff;

/* Cores de status */
--success: #16a34a;        /* Verde - sucesso */
--warning: #d97706;        /* Laranja - aviso */
--error: #dc2626;          /* Vermelho - erro */
--info: #0ea5e9;           /* Azul - informação */

/* Cores neutras */
--background: #ffffff;
--foreground: #0f172a;
--muted: #f8fafc;
--border: #e2e8f0;
```

### Tipografia

```css
/* Hierarquia de títulos */
h1: 2.25rem (36px) - Títulos principais
h2: 1.875rem (30px) - Seções importantes
h3: 1.5rem (24px) - Subsseções
h4: 1.25rem (20px) - Elementos menores

/* Texto corpo */
body: 1rem (16px) - Texto padrão
small: 0.875rem (14px) - Texto secundário
```

### Espaçamento

```css
/* Sistema de espaçamento (baseado em 4px) */
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

## Padrões de Interação

### Feedback Visual

1. **Estados de Loading**
   - Use skeleton screens em vez de spinners
   - Componentes específicos para cada tipo de conteúdo
   - Animação sutil de pulso para indicar carregamento

2. **Confirmações de Ação**
   - Status badges para estados (ativo, inativo, processando)
   - Notificações toast para ações concluídas
   - Indicadores de progresso para operações longas

3. **Tratamento de Erros**
   - Mensagens claras e acionáveis
   - Sugestões de correção quando possível
   - Validação em tempo real em formulários

### Navegação

1. **Breadcrumbs**
   - Sempre presente em páginas internas
   - Máximo de 5 níveis visíveis
   - Links funcionais para navegação rápida

2. **Menu Principal**
   - Máximo 7 itens no menu principal
   - Agrupamento lógico por funcionalidade
   - Ícones consistentes e reconhecíveis

3. **Busca Global**
   - Sempre acessível no cabeçalho
   - Sugestões automáticas
   - Filtros por tipo de conteúdo

## Componentes Específicos

### Notificações

```tsx
// Uso do sistema de notificações
import { useNotifications } from '@/hooks/use-notifications'

const { showNotification } = useNotifications()

// Notificação de sucesso
showNotification({
  type: 'success',
  title: 'Ação realizada',
  description: 'Dados salvos com sucesso'
})
```

### Status e Badges

```tsx
// Status de conselheiro
<ConselheiroStatusBadge status="ativo" />

// Status de reunião
<ReuniaoStatusBadge status="agendada" />

// Status de protocolo
<ProtocoloStatusBadge status="gerado" />
```

### Formulários Responsivos

```tsx
// Layout adaptativo
<ResponsiveForm layout="double">
  <Input label="Nome" />
  <Input label="Email" />
</ResponsiveForm>
```

### Ajuda Contextual

```tsx
// Ícone de ajuda
<HelpIcon 
  content="Esta informação ajuda o usuário a entender o campo"
  title="Ajuda"
/>

// Instruções passo-a-passo
<StepByStepGuide steps={[
  { number: 1, title: "Passo 1", description: "Descrição..." },
  { number: 2, title: "Passo 2", description: "Descrição..." }
]} />
```

## Fluxos de Usuário

### Cadastro de Conselheiro

1. **Entrada**: Menu "Conselheiros" → "Novo Conselheiro"
2. **Formulário**: Campos organizados em seções lógicas
3. **Validação**: Feedback em tempo real
4. **Confirmação**: Notificação de sucesso + redirecionamento

### Agendamento de Reunião

1. **Entrada**: Dashboard → "Agendar Reunião"
2. **Seleção**: Data/hora com calendário visual
3. **Detalhes**: Pauta e participantes
4. **Confirmação**: Email automático + notificação

### Geração de Protocolo

1. **Entrada**: Formulário específico
2. **Preenchimento**: Campos obrigatórios destacados
3. **Validação**: Verificação de dados
4. **Geração**: Indicador de progresso
5. **Resultado**: Download + visualização

## Testes de Usabilidade

### Métricas Importantes

1. **Taxa de Conclusão**: % de tarefas completadas com sucesso
2. **Tempo de Tarefa**: Tempo médio para completar ações
3. **Taxa de Erro**: Frequência de erros por usuário
4. **Satisfação**: Avaliação subjetiva (1-5 estrelas)

### Cenários de Teste

1. **Cadastro de novo conselheiro**
   - Tempo esperado: < 3 minutos
   - Taxa de sucesso: > 90%

2. **Agendamento de reunião**
   - Tempo esperado: < 2 minutos
   - Taxa de sucesso: > 95%

3. **Busca de informações**
   - Tempo esperado: < 30 segundos
   - Taxa de sucesso: > 85%

## Sistema de Feedback

### Coleta Contínua

1. **Widget de Feedback**
   - Sempre visível no canto inferior direito
   - Feedback rápido (👍/👎) e detalhado
   - Categorização automática

2. **Métricas Automáticas**
   - Tempo em página
   - Profundidade de scroll
   - Cliques e interações
   - Erros JavaScript

### Análise e Melhoria

1. **Revisão Semanal**: Análise de feedback e métricas
2. **Priorização**: Problemas por impacto e frequência
3. **Implementação**: Melhorias incrementais
4. **Validação**: Testes A/B quando necessário

## Checklist de Qualidade

### Antes do Deploy

- [ ] Contraste de cores validado (WCAG AA)
- [ ] Navegação por teclado funcional
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Textos revisados (clareza e gramática)
- [ ] Fluxos principais testados
- [ ] Performance otimizada (< 3s carregamento)
- [ ] Feedback visual implementado
- [ ] Sistema de ajuda contextual ativo

### Monitoramento Contínuo

- [ ] Métricas de usabilidade coletadas
- [ ] Feedback dos usuários analisado
- [ ] Problemas de acessibilidade reportados
- [ ] Performance monitorada
- [ ] Erros JavaScript rastreados

## Recursos e Ferramentas

### Desenvolvimento

- **Componentes**: Radix UI + Tailwind CSS
- **Ícones**: Lucide React
- **Animações**: Framer Motion (quando necessário)
- **Testes**: Jest + Testing Library

### Validação

- **Acessibilidade**: axe-core, WAVE
- **Performance**: Lighthouse, Web Vitals
- **Responsividade**: Browser DevTools
- **Usabilidade**: Hotjar, Google Analytics

## Contato e Suporte

Para dúvidas sobre estas diretrizes ou sugestões de melhoria:

- **Equipe UX**: ux@codema.gov.br
- **Documentação**: [Link para documentação técnica]
- **Feedback**: Use o widget de feedback no sistema

---

*Última atualização: Janeiro 2025*
*Versão: 1.0*
