import { NavigationConfig, NavigationSection, NavigationItem, UserRole } from '@/types/navigation';

// CODEMA Navigation Configuration
// This file defines the complete navigation structure with role-based access control

const publicNavigationSections: NavigationSection[] = [
  {
    id: 'main',
    label: 'Navegação Principal',
    accessibility: {
      ariaLabel: 'Navegação principal do site',
      landmarkRole: 'navigation'
    },
    items: [
      {
        id: 'home',
        label: 'Início',
        href: '/',
        icon: 'Home',
        description: 'Página inicial do CODEMA',
        accessibility: {
          ariaLabel: 'Ir para página inicial',
          keyboardShortcut: 'Alt+1'
        }
      },
      {
        id: 'reports',
        label: 'Relatórios',
        href: '/relatorios',
        icon: 'FileText',
        description: 'Visualizar relatórios públicos',
        accessibility: {
          ariaLabel: 'Visualizar relatórios públicos',
          keyboardShortcut: 'Alt+2'
        }
      },
      {
        id: 'about',
        label: 'Sobre',
        href: '/sobre',
        icon: 'Info',
        description: 'Informações sobre o CODEMA',
        accessibility: {
          ariaLabel: 'Informações sobre o CODEMA'
        }
      }
    ]
  },
  {
    id: 'auth',
    label: 'Autenticação',
    accessibility: {
      ariaLabel: 'Área de autenticação',
      landmarkRole: 'banner'
    },
    items: [
      {
        id: 'login',
        label: 'Entrar',
        href: '/auth',
        icon: 'LogIn',
        description: 'Fazer login no sistema',
        accessibility: {
          ariaLabel: 'Fazer login no sistema',
          keyboardShortcut: 'Alt+L'
        }
      }
    ]
  }
];

const authenticatedNavigationSections: NavigationSection[] = [
  {
    id: 'main',
    label: 'Navegação Principal',
    accessibility: {
      ariaLabel: 'Navegação principal do sistema',
      landmarkRole: 'navigation'
    },
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'LayoutDashboard',
        description: 'Painel de controle principal',
        accessibility: {
          ariaLabel: 'Ir para o painel de controle',
          keyboardShortcut: 'Alt+D'
        }
      },
      {
        id: 'reports',
        label: 'Relatórios',
        href: '/relatorios',
        icon: 'FileText',
        description: 'Visualizar e gerenciar relatórios',
        accessibility: {
          ariaLabel: 'Visualizar e gerenciar relatórios',
          keyboardShortcut: 'Alt+R'
        }
      },
      {
        id: 'create-report',
        label: 'Criar Relatório',
        href: '/criar-relatorio',
        icon: 'Plus',
        description: 'Criar um novo relatório',
        accessibility: {
          ariaLabel: 'Criar um novo relatório',
          keyboardShortcut: 'Alt+N'
        }
      }
    ]
  },
  {
    id: 'meetings',
    label: 'Reuniões e Documentos',
    accessibility: {
      ariaLabel: 'Seção de reuniões e documentos',
      landmarkRole: 'navigation'
    },
    items: [
      {
        id: 'meetings',
        label: 'Reuniões',
        href: '/reunioes',
        icon: 'Calendar',
        description: 'Gerenciar reuniões do conselho',
        accessibility: {
          ariaLabel: 'Gerenciar reuniões do conselho',
          keyboardShortcut: 'Alt+M'
        }
      },
      {
        id: 'documents',
        label: 'Documentos',
        href: '/documentos',
        icon: 'Files',
        description: 'Gerenciar documentos oficiais',
        accessibility: {
          ariaLabel: 'Gerenciar documentos oficiais',
          keyboardShortcut: 'Alt+F'
        }
      }
    ]
  },
  {
    id: 'codema',
    label: 'CODEMA',
    requiredRoles: ['admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente'],
    accessibility: {
      ariaLabel: 'Seção do Conselho Municipal de Defesa do Meio Ambiente',
      landmarkRole: 'navigation'
    },
    items: [
      {
        id: 'councillors',
        label: 'Conselheiros',
        href: '/codema/conselheiros',
        icon: 'Users',
        description: 'Gerenciar membros do conselho',
        requiredRoles: ['admin', 'secretario', 'presidente'],
        accessibility: {
          ariaLabel: 'Gerenciar conselheiros do CODEMA',
          keyboardShortcut: 'Alt+C'
        }
      },
      {
        id: 'codema-meetings',
        label: 'Reuniões CODEMA',
        href: '/codema/reunioes',
        icon: 'Calendar',
        description: 'Gerenciar reuniões e convocações',
        requiredRoles: ['admin', 'secretario', 'presidente', 'conselheiro_titular'],
        accessibility: {
          ariaLabel: 'Gerenciar reuniões do CODEMA'
        }
      },
      {
        id: 'minutes',
        label: 'Atas',
        href: '/codema/atas',
        icon: 'FileText',
        description: 'Gerenciar atas das reuniões',
        requiredRoles: ['admin', 'secretario', 'presidente'],
        accessibility: {
          ariaLabel: 'Gerenciar atas do CODEMA'
        }
      },
      {
        id: 'resolutions',
        label: 'Resoluções',
        href: '/codema/resolucoes',
        icon: 'Gavel',
        description: 'Gerenciar resoluções do conselho',
        accessibility: {
          ariaLabel: 'Gerenciar resoluções do CODEMA'
        }
      }
    ]
  },
  {
    id: 'admin',
    label: 'Administração',
    requiredRoles: ['admin', 'secretario', 'presidente'],
    accessibility: {
      ariaLabel: 'Seção administrativa',
      landmarkRole: 'navigation'
    },
    items: [
      {
        id: 'admin-dashboard',
        label: 'Painel Administrativo',
        href: '/admin',
        icon: 'Settings',
        description: 'Painel de administração do sistema',
        requiredRoles: ['admin', 'secretario', 'presidente'],
        accessibility: {
          ariaLabel: 'Acessar painel de administração',
          keyboardShortcut: 'Alt+A'
        }
      },
      {
        id: 'user-management',
        label: 'Gerenciar Usuários',
        href: '/admin/usuarios',
        icon: 'Users',
        description: 'Gerenciar usuários do sistema',
        requiredRoles: ['admin', 'secretario'],
        accessibility: {
          ariaLabel: 'Gerenciar usuários do sistema',
          keyboardShortcut: 'Alt+U'
        }
      },
      {
        id: 'system-settings',
        label: 'Configurações',
        href: '/admin/configuracoes',
        icon: 'Cog',
        description: 'Configurações do sistema',
        requiredRoles: ['admin'],
        accessibility: {
          ariaLabel: 'Acessar configurações do sistema',
          keyboardShortcut: 'Alt+S'
        }
      }
    ]
  },
  {
    id: 'user',
    label: 'Usuário',
    accessibility: {
      ariaLabel: 'Área do usuário',
      landmarkRole: 'banner'
    },
    items: [
      {
        id: 'profile',
        label: 'Perfil',
        href: '/perfil',
        icon: 'User',
        description: 'Gerenciar perfil do usuário',
        accessibility: {
          ariaLabel: 'Gerenciar perfil do usuário',
          keyboardShortcut: 'Alt+P'
        }
      },
      {
        id: 'logout',
        label: 'Sair',
        href: '/logout',
        icon: 'LogOut',
        description: 'Sair do sistema',
        accessibility: {
          ariaLabel: 'Sair do sistema',
          keyboardShortcut: 'Alt+Q'
        }
      }
    ]
  }
];

// Role-based permissions mapping
const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'], // All permissions
  secretario: ['read', 'write', 'manage_users', 'manage_meetings', 'manage_documents'],
  presidente: ['read', 'write', 'manage_meetings', 'manage_documents'],
  conselheiro_titular: ['read', 'write', 'create_reports'],
  conselheiro_suplente: ['read', 'create_reports'],
  user: ['read']
};

// Skip links configuration
const skipLinks = [
  {
    id: 'skip-to-main',
    label: 'Pular para o conteúdo principal',
    targetId: 'main-content',
    keyboardShortcut: 'Alt+Enter'
  },
  {
    id: 'skip-to-nav',
    label: 'Pular para a navegação',
    targetId: 'navigation',
    keyboardShortcut: 'Alt+N'
  },
  {
    id: 'skip-to-footer',
    label: 'Pular para o rodapé',
    targetId: 'footer',
    keyboardShortcut: 'Alt+F'
  }
];

// Keyboard navigation configuration
const keyboardNavigation = {
  enabled: true,
  keys: {
    next: ['ArrowDown', 'Tab'],
    previous: ['ArrowUp', 'Shift+Tab'],
    open: ['Enter', 'Space'],
    close: ['Escape'],
    home: ['Home'],
    end: ['End']
  }
};

// Factory function to create navigation config
export function createNavigationConfig(
  isAuthenticated: boolean,
  userRole?: UserRole,
  variant: 'horizontal' | 'sidebar' | 'mobile' = 'sidebar'
): NavigationConfig {
  const sections = isAuthenticated 
    ? authenticatedNavigationSections 
    : publicNavigationSections;

  // Filter sections and items based on user role
  const filteredSections = sections
    .filter(section => {
      if (!section.requiredRoles) return true;
      if (!userRole) return false;
      return section.requiredRoles.includes(userRole);
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!item.requiredRoles) return true;
        if (!userRole) return false;
        return item.requiredRoles.includes(userRole);
      })
    }))
    .filter(section => section.items.length > 0);

  return {
    sections: filteredSections,
    variant,
    isAuthenticated,
    userRole,
    permissions: userRole ? rolePermissions[userRole] : [],
    features: {
      showBadges: true,
      showIcons: true,
      showTooltips: true,
      enableKeyboardShortcuts: true,
      enableSkipLinks: true
    }
  };
}

// Accessibility features configuration
export const accessibilityFeatures = {
  skipLinks,
  announcements: [],
  focusTrap: false,
  autoFocus: false,
  keyboardNavigation
};

// Export default configurations for common use cases
export const publicNavigationConfig = createNavigationConfig(false, undefined, 'horizontal');
export const authenticatedNavigationConfig = (userRole: UserRole) => 
  createNavigationConfig(true, userRole, 'sidebar');

// Export navigation analytics tracking functions
export const navigationAnalytics = {
  trackItemClick: (item: NavigationItem) => {
    // Analytics implementation would go here
    console.log('Navigation item clicked:', item.id);
  },
  trackSectionExpand: (section: NavigationSection) => {
    console.log('Navigation section expanded:', section.id);
  },
  trackKeyboardUsage: (key: string, action: string) => {
    console.log('Keyboard navigation:', key, action);
  },
  trackAccessibilityFeature: (feature: string) => {
    console.log('Accessibility feature used:', feature);
  }
};