# Sistema de Autenticação Unificado CODEMA - Exemplos de Uso

## 📋 Visão Geral

Este documento apresenta exemplos práticos de como usar o novo sistema de autenticação unificado do CODEMA, baseado no `AuthService` centralizado.

## 🚀 Configuração Inicial

### 1. Configurar o Provider na Aplicação

```typescript
// src/main.tsx ou App.tsx
import React from 'react';
import { UnifiedAuthProvider } from '@/components/auth/UnifiedAuthProvider';

function App() {
  return (
    <UnifiedAuthProvider>
      <Router>
        <Routes>
          {/* Suas rotas aqui */}
        </Routes>
      </Router>
    </UnifiedAuthProvider>
  );
}
```

### 2. Usar o Hook em Componentes

```typescript
// src/components/ExampleComponent.tsx
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export function ExampleComponent() {
  const { user, profile, loading, signOut } = useUnifiedAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Bem-vindo, {profile?.full_name || user?.email}!</h1>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

## 🔐 Exemplos de Autenticação

### Login com Email e Senha

```typescript
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useUnifiedAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn(email, password);
    
    if (!result.error) {
      // Login bem-sucedido - o usuário será redirecionado automaticamente
      console.log('Login realizado com sucesso!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

### Registro de Usuário

```typescript
// src/components/RegisterForm.tsx
import { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    neighborhood: ''
  });
  
  const { signUp, loading, error } = useUnifiedAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signUp(formData);
    
    if (!result.error) {
      alert('Cadastro realizado! Verifique seu email para confirmar a conta.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        placeholder="Nome completo"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        placeholder="Senha"
        required
      />
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        placeholder="Telefone"
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  );
}
```

### Magic Link

```typescript
// src/components/MagicLinkForm.tsx
import { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const { signInWithMagicLink, loading, error } = useUnifiedAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signInWithMagicLink(email);
    
    if (!result.error) {
      alert('Link mágico enviado! Verifique seu email.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Link Mágico'}
      </button>
    </form>
  );
}
```

## 🛡️ Controle de Permissões

### Verificação Simples de Permissões

```typescript
// src/components/PermissionGate.tsx
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { hasPermission } = useUnifiedAuth();
  
  if (!hasPermission(permission)) {
    return fallback || <div>Você não tem permissão para acessar este conteúdo.</div>;
  }
  
  return <>{children}</>;
}

// Uso:
<PermissionGate permission="manage_fma">
  <FMAManagementPanel />
</PermissionGate>
```

### Controle por Roles

```typescript
// src/components/RoleBasedComponent.tsx
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export function AdminPanel() {
  const { hasAdminAccess, isPresidente, isSecretario } = useUnifiedAuth();
  
  if (!hasAdminAccess) {
    return <div>Acesso negado.</div>;
  }
  
  return (
    <div>
      <h1>Painel Administrativo</h1>
      
      {isPresidente && (
        <section>
          <h2>Funções do Presidente</h2>
          <button>Gerenciar Usuários</button>
        </section>
      )}
      
      {isSecretario && (
        <section>
          <h2>Funções do Secretário</h2>
          <button>Gerenciar Processos</button>
        </section>
      )}
    </div>
  );
}
```

## 👤 Gerenciamento de Perfil

### Atualização de Perfil

```typescript
// src/components/ProfileForm.tsx
import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export function ProfileForm() {
  const { profile, updateProfile, loading, error } = useUnifiedAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    neighborhood: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        neighborhood: profile.neighborhood || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await updateProfile(formData);
    
    if (!result.error) {
      alert('Perfil atualizado com sucesso!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        placeholder="Nome completo"
      />
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        placeholder="Telefone"
      />
      <input
        type="text"
        value={formData.address}
        onChange={(e) => setFormData({...formData, address: e.target.value})}
        placeholder="Endereço"
      />
      <input
        type="text"
        value={formData.neighborhood}
        onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
        placeholder="Bairro"
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Atualizando...' : 'Atualizar Perfil'}
      </button>
    </form>
  );
}
```

## 🔒 Proteção de Rotas

### Middleware de Autenticação

```typescript
// src/components/ProtectedRoute.tsx
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, profile, loading, hasPermission } = useUnifiedAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Uso nas rotas:
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredPermission="manage_users">
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

## 📊 Componentes de Status

### Indicador de Estado de Autenticação

```typescript
// src/components/AuthStatus.tsx
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export function AuthStatus() {
  const { user, profile, loading, error, clearError } = useUnifiedAuth();

  if (loading) {
    return <div className="auth-status loading">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="auth-status error">
        <span>Erro: {error}</span>
        <button onClick={clearError}>Limpar</button>
      </div>
    );
  }

  if (!user) {
    return <div className="auth-status">Não autenticado</div>;
  }

  return (
    <div className="auth-status success">
      <span>Logado como: {profile?.full_name || user.email}</span>
      <span>Role: {profile?.role}</span>
    </div>
  );
}
```

## 🔧 Utilitários

### Hook para Validação de Formulários

```typescript
// src/hooks/useAuthValidation.ts
import { useState } from 'react';
import { authService } from '@/services/auth/AuthService';

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function useAuthValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateLogin = (email: string, password: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!authService.validateEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = (email: string, password: string, fullName: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!authService.validateEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    const passwordValidation = authService.validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (!fullName.trim()) {
      newErrors.general = 'Nome completo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => setErrors({});

  return {
    errors,
    validateLogin,
    validateRegister,
    clearErrors
  };
}
```

## 🎯 Migração do Sistema Atual

### Passos para Migrar

1. **Instalar o novo sistema**:
```bash
# Nenhuma instalação necessária - tudo já está implementado
```

2. **Substituir o AuthProvider atual**:
```typescript
// Antes:
<AuthProvider>
  <App />
</AuthProvider>

// Depois:
<UnifiedAuthProvider>
  <App />
</UnifiedAuthProvider>
```

3. **Atualizar hooks existentes**:
```typescript
// Antes:
const { user, profile, hasAdminAccess } = useAuth();

// Depois:
const { user, profile, hasAdminAccess } = useUnifiedAuth();
```

4. **Atualizar chamadas de autenticação**:
```typescript
// Antes:
const { error } = await supabase.auth.signInWithPassword({
  email: data.email,
  password: data.password
});

// Depois:
const { error } = await signIn(data.email, data.password);
```

## 🔮 Funcionalidades Futuras

### OAuth Integration
```typescript
// Futura implementação de OAuth
const { signInWithGoogle, signInWithMicrosoft } = useUnifiedAuth();

// Uso:
await signInWithGoogle();
await signInWithMicrosoft();
```

### 2FA/MFA
```typescript
// Futura implementação de 2FA
const { enable2FA, verify2FA } = useUnifiedAuth();

// Uso:
await enable2FA();
await verify2FA(code);
```

## 📝 Considerações Importantes

1. **Compatibilidade**: O sistema é 100% compatível com o Supabase Auth
2. **Performance**: Hooks otimizados para evitar re-renders desnecessários
3. **Segurança**: Validações centralizadas e auditoria completa
4. **Flexibilidade**: Fácil extensão para novas funcionalidades
5. **Manutenibilidade**: Código centralizado e bem documentado

## 🚀 Próximos Passos

1. Implementar o sistema em ambiente de desenvolvimento
2. Testar todas as funcionalidades existentes
3. Migrar gradualmente os componentes
4. Adicionar testes automatizados
5. Documentar mudanças para a equipe

Este sistema unificado oferece uma base sólida e escalável para o gerenciamento de autenticação no CODEMA, seguindo as melhores práticas do Supabase Auth. 