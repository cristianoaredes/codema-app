import { UserRole, Permission, RolePermissions } from '@/types/navigation';

// Define all available permissions in the system
export const PERMISSIONS = {
  // Read permissions
  READ_REPORTS: 'read_reports',
  READ_MEETINGS: 'read_meetings',
  READ_DOCUMENTS: 'read_documents',
  READ_USERS: 'read_users',
  READ_SETTINGS: 'read_settings',
  
  // Write permissions
  CREATE_REPORTS: 'create_reports',
  EDIT_REPORTS: 'edit_reports',
  DELETE_REPORTS: 'delete_reports',
  
  CREATE_MEETINGS: 'create_meetings',
  EDIT_MEETINGS: 'edit_meetings',
  DELETE_MEETINGS: 'delete_meetings',
  
  UPLOAD_DOCUMENTS: 'upload_documents',
  EDIT_DOCUMENTS: 'edit_documents',
  DELETE_DOCUMENTS: 'delete_documents',
  
  // User management permissions
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Administrative permissions
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  SYSTEM_ADMIN: 'system_admin',
  
  // Special permissions
  ALL: '*'
} as const;

// Permission definitions with metadata
export const permissionDefinitions: Permission[] = [
  // Read permissions
  {
    id: PERMISSIONS.READ_REPORTS,
    name: 'Visualizar Relatórios',
    description: 'Permite visualizar relatórios do sistema',
    category: 'read'
  },
  {
    id: PERMISSIONS.READ_MEETINGS,
    name: 'Visualizar Reuniões',
    description: 'Permite visualizar reuniões e suas informações',
    category: 'read'
  },
  {
    id: PERMISSIONS.READ_DOCUMENTS,
    name: 'Visualizar Documentos',
    description: 'Permite visualizar documentos do sistema',
    category: 'read'
  },
  {
    id: PERMISSIONS.READ_USERS,
    name: 'Visualizar Usuários',
    description: 'Permite visualizar lista de usuários',
    category: 'read'
  },
  {
    id: PERMISSIONS.READ_SETTINGS,
    name: 'Visualizar Configurações',
    description: 'Permite visualizar configurações do sistema',
    category: 'read'
  },
  
  // Write permissions
  {
    id: PERMISSIONS.CREATE_REPORTS,
    name: 'Criar Relatórios',
    description: 'Permite criar novos relatórios',
    category: 'write'
  },
  {
    id: PERMISSIONS.EDIT_REPORTS,
    name: 'Editar Relatórios',
    description: 'Permite editar relatórios existentes',
    category: 'write'
  },
  {
    id: PERMISSIONS.DELETE_REPORTS,
    name: 'Excluir Relatórios',
    description: 'Permite excluir relatórios',
    category: 'write'
  },
  {
    id: PERMISSIONS.CREATE_MEETINGS,
    name: 'Criar Reuniões',
    description: 'Permite criar e agendar reuniões',
    category: 'write'
  },
  {
    id: PERMISSIONS.EDIT_MEETINGS,
    name: 'Editar Reuniões',
    description: 'Permite editar reuniões existentes',
    category: 'write'
  },
  {
    id: PERMISSIONS.DELETE_MEETINGS,
    name: 'Excluir Reuniões',
    description: 'Permite excluir reuniões',
    category: 'write'
  },
  {
    id: PERMISSIONS.UPLOAD_DOCUMENTS,
    name: 'Upload de Documentos',
    description: 'Permite fazer upload de documentos',
    category: 'write'
  },
  {
    id: PERMISSIONS.EDIT_DOCUMENTS,
    name: 'Editar Documentos',
    description: 'Permite editar documentos existentes',
    category: 'write'
  },
  {
    id: PERMISSIONS.DELETE_DOCUMENTS,
    name: 'Excluir Documentos',
    description: 'Permite excluir documentos',
    category: 'write'
  },
  
  // Admin permissions
  {
    id: PERMISSIONS.CREATE_USERS,
    name: 'Criar Usuários',
    description: 'Permite criar novos usuários no sistema',
    category: 'admin'
  },
  {
    id: PERMISSIONS.EDIT_USERS,
    name: 'Editar Usuários',
    description: 'Permite editar informações de usuários',
    category: 'admin'
  },
  {
    id: PERMISSIONS.DELETE_USERS,
    name: 'Excluir Usuários',
    description: 'Permite excluir usuários do sistema',
    category: 'admin'
  },
  {
    id: PERMISSIONS.MANAGE_ROLES,
    name: 'Gerenciar Funções',
    description: 'Permite gerenciar funções e permissões',
    category: 'admin'
  },
  {
    id: PERMISSIONS.MANAGE_SETTINGS,
    name: 'Gerenciar Configurações',
    description: 'Permite alterar configurações do sistema',
    category: 'admin'
  },
  {
    id: PERMISSIONS.VIEW_ANALYTICS,
    name: 'Visualizar Analytics',
    description: 'Permite visualizar relatórios analíticos',
    category: 'admin'
  },
  {
    id: PERMISSIONS.EXPORT_DATA,
    name: 'Exportar Dados',
    description: 'Permite exportar dados do sistema',
    category: 'admin'
  },
  {
    id: PERMISSIONS.SYSTEM_ADMIN,
    name: 'Administrador do Sistema',
    description: 'Acesso total ao sistema',
    category: 'special'
  }
];

// Role-based permission mapping
export const rolePermissions: RolePermissions = {
  admin: [
    // Admin has all permissions
    ...permissionDefinitions
  ],
  
  secretario: [
    // Secretary permissions - read, write, and specific admin permissions
    ...permissionDefinitions.filter(p => {
      if (p.category === 'read' || p.category === 'write') return true;
      const adminPermissions = [
        PERMISSIONS.CREATE_USERS,
        PERMISSIONS.EDIT_USERS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.EXPORT_DATA
      ];
      return adminPermissions.some(perm => perm === p.id);
    })
  ],
  
  presidente: [
    // President permissions - read, write, and analytics
    ...permissionDefinitions.filter(p => {
      if (p.category === 'read' || p.category === 'write') return true;
      const presidentPermissions = [
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.EXPORT_DATA
      ];
      return presidentPermissions.some(perm => perm === p.id);
    })
  ],
  
  conselheiro_titular: [
    // Full council member permissions - read and specific write permissions
    ...permissionDefinitions.filter(p => {
      if (p.category === 'read') return true;
      const councilPermissions = [
        PERMISSIONS.CREATE_REPORTS,
        PERMISSIONS.EDIT_REPORTS,
        PERMISSIONS.CREATE_MEETINGS,
        PERMISSIONS.UPLOAD_DOCUMENTS
      ];
      return councilPermissions.some(perm => perm === p.id);
    })
  ],
  
  conselheiro_suplente: [
    // Substitute council member permissions - read and limited write
    ...permissionDefinitions.filter(p => {
      if (p.category === 'read') return true;
      const substitutePermissions = [
        PERMISSIONS.CREATE_REPORTS,
        PERMISSIONS.UPLOAD_DOCUMENTS
      ];
      return substitutePermissions.some(perm => perm === p.id);
    })
  ],
  
  user: [
    // Basic user permissions
    ...permissionDefinitions.filter(p => p.category === 'read')
  ]
};

// Permission checking utilities
export class PermissionChecker {
  private userRole: UserRole;
  private userPermissions: string[];

  constructor(userRole: UserRole) {
    this.userRole = userRole;
    this.userPermissions = this.getUserPermissions(userRole);
  }

  private getUserPermissions(role: UserRole): string[] {
    const permissions = rolePermissions[role] || [];
    return permissions.map(p => p.id);
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission) || 
           this.userPermissions.includes(PERMISSIONS.ALL);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this.userRole === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.userRole);
  }

  /**
   * Get all permissions for the current user
   */
  getAllPermissions(): Permission[] {
    return rolePermissions[this.userRole] || [];
  }

  /**
   * Get permissions by category
   */
  getPermissionsByCategory(category: Permission['category']): Permission[] {
    return this.getAllPermissions().filter(p => p.category === category);
  }
}

// Utility functions
export function createPermissionChecker(userRole: UserRole): PermissionChecker {
  return new PermissionChecker(userRole);
}

export function getUserPermissions(userRole: UserRole): string[] {
  const permissions = rolePermissions[userRole] || [];
  return permissions.map(p => p.id);
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const checker = createPermissionChecker(userRole);
  return checker.hasPermission(permission);
}

export function hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
  const checker = createPermissionChecker(userRole);
  return checker.hasAnyPermission(permissions);
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

export function hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// Role hierarchy utilities
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  secretario: 80,
  presidente: 70,
  conselheiro_titular: 50,
  conselheiro_suplente: 30,
  user: 10
};

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0;
}

export function hasHigherRole(userRole: UserRole, compareRole: UserRole): boolean {
  return getRoleLevel(userRole) > getRoleLevel(compareRole);
}

export function hasEqualOrHigherRole(userRole: UserRole, compareRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(compareRole);
}

// Role display utilities
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  secretario: 'Secretário',
  presidente: 'Presidente',
  conselheiro_titular: 'Conselheiro Titular',
  conselheiro_suplente: 'Conselheiro Suplente',
  user: 'Usuário'
};

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role;
}

export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_LABELS) as UserRole[];
}

export function getAvailableRoles(currentUserRole: UserRole): UserRole[] {
  const currentLevel = getRoleLevel(currentUserRole);
  return getAllRoles().filter(role => getRoleLevel(role) <= currentLevel);
}