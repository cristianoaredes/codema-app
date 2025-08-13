# Sistema de Cores CODEMA

Este documento define o sistema de cores padronizado para a aplicação CODEMA, garantindo consistência visual e acessibilidade.

## Cores Primárias

### Primary (Verde CODEMA)
```css
--primary: 156 70% 22%          /* Verde escuro institucional */
--primary-foreground: 0 0% 98%  /* Texto sobre primary */
--primary-hover: 156 70% 18%    /* Hover state */
--primary-glow: 156 60% 35%     /* Glow effects */
```

**Uso no Tailwind:**
- `bg-primary` - Fundos de botões principais, logos
- `text-primary` - Links, textos importantes
- `border-primary` - Bordas de elementos ativos

### Secondary (Dourado)
```css
--secondary: 45 85% 48%           /* Dourado complementar */
--secondary-foreground: 220 20% 20%
--secondary-hover: 45 80% 44%
```

## Cores de Status

### Success (Verde)
- Use `text-emerald-600` para textos de sucesso
- Use `bg-emerald-100 text-emerald-800` para badges de status ativo

### Warning (Amarelo/Âmbar)  
- Use `text-amber-600` para alertas
- Use `bg-amber-100 text-amber-800` para badges de licenciado

### Error/Destructive (Vermelho)
- Use `text-destructive` para ações destrutivas
- Use `bg-red-100 text-red-800` para badges de afastado

## Cores Neutras

### Background & Foreground
```css
--background: 0 0% 100%          /* Fundo principal */
--foreground: 220 15% 25%        /* Texto principal */
--card: 0 0% 100%               /* Fundo de cards */
--card-foreground: 220 15% 25%  /* Texto em cards */
```

### Muted (Textos secundários)
```css
--muted: 156 15% 96%            /* Fundos sutis */
--muted-foreground: 220 10% 50% /* Textos secundários */
```

### Accent (Hover states)
```css
--accent: 156 25% 94%           /* Hover de elementos neutros */
--accent-foreground: 156 70% 22%
```

## Aplicação Prática

### ✅ Correto
```jsx
// Usando tokens do design system
<div className="bg-primary text-primary-foreground">
<span className="text-emerald-600">Ativo</span>
<Button className="text-destructive">Remover</Button>
```

### ❌ Evitar
```jsx
// Cores hardcoded
<div className="bg-blue-600 text-white">
<span className="text-green-600">Ativo</span> 
<Button className="text-red-600">Remover</Button>
```

## Modo Escuro

O sistema suporta automaticamente modo escuro através das variáveis CSS:

```css
.dark {
  --primary: 156 60% 45%;         /* Verde mais claro no escuro */
  --background: 156 25% 8%;       /* Fundo escuro */
  --foreground: 0 0% 95%;        /* Texto claro */
}
```

## Acessibilidade

- Todas as cores seguem contraste mínimo WCAG AA (4.5:1)
- Estados de hover têm contraste adequado
- Focus states usam `ring-primary` para consistência

## Sidebar

O sidebar usa um esquema próprio mas consistente:

```css
--sidebar-background: 0 0% 98%    /* Fundo claro */
--sidebar-primary: 156 70% 22%    /* Verde CODEMA */
--sidebar-accent: 156 20% 95%     /* Hover state */
```

## Implementação

Todos os componentes devem usar as classes Tailwind baseadas nos tokens CSS:

1. **Cores principais**: `bg-primary`, `text-primary`, `border-primary`
2. **Status**: `text-emerald-600`, `text-amber-600`, `text-destructive`
3. **Neutros**: `text-foreground`, `text-muted-foreground`, `bg-accent`
4. **Interações**: `hover:bg-accent`, `hover:text-primary`

Este sistema garante consistência visual, facilita manutenção e melhora a experiência do usuário.