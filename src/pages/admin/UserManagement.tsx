import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { secureAuthService } from "@/services/auth/SecureAuthorizationService";
import { UserRole } from "@/types/auth";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { useToast } from '@/hooks';
import { Users, Search, Edit, Shield, UserCheck, User, UserX, UserPlus, Mail, BarChart3, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';
import { Tabs as _Tabs, TabsContent as _TabsContent, TabsList as _TabsList, TabsTrigger as _TabsTrigger } from '@/components/ui';
import { UserManagementService, CreateUserRequest, InviteUserRequest } from '@/services/userManagement';
import { PresidencyDelegation } from '@/components/admin/PresidencyDelegation';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  neighborhood: string | null;
  role: UserRole;
  is_active: boolean;
  deactivation_reason: string | null;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  by_role: Record<string, number>;
  recent_registrations: number;
}

const UserManagement = () => {
  const { profile } = useAuth(); // Legacy compatibility
  const { hasSecurePermission } = useSecureAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [hasManagePermission, setHasManagePermission] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);

  // Form states for creating users
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    email: '',
    password: '',
    full_name: '',
    role: 'citizen',
    phone: '',
    address: '',
    neighborhood: ''
  });

  // Form states for inviting users
  const [inviteForm, setInviteForm] = useState<InviteUserRequest>({
    email: '',
    role: 'citizen',
    full_name: '',
    phone: '',
    address: '',
    neighborhood: '',
    message: ''
  });

  const roles = [
    { value: 'citizen', label: 'Cidadão', icon: User, color: 'secondary' },
    { value: 'conselheiro_suplente', label: 'Conselheiro Suplente', icon: UserCheck, color: 'outline' },
    { value: 'conselheiro_titular', label: 'Conselheiro Titular', icon: UserCheck, color: 'default' },
    { value: 'secretario', label: 'Secretário', icon: Users, color: 'default' },
    { value: 'vice_presidente', label: 'Vice-Presidente', icon: Shield, color: 'default' },
    { value: 'presidente', label: 'Presidente', icon: Shield, color: 'default' },
    { value: 'moderator', label: 'Moderador', icon: Shield, color: 'outline' },
    { value: 'admin', label: 'Administrador', icon: Shield, color: 'destructive' },
  ] as const;

  const getRoleInfo = (role: string) => {
    return roles.find(r => r.value === role) || roles[0];
  };

  const fetchUsers = useCallback(async () => {
    if (!hasManagePermission) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers((data || []) as Profile[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      });
    }
  }, [hasManagePermission, toast]);

  const fetchStats = useCallback(async () => {
    if (!hasManagePermission) return;
    
    const result = await UserManagementService.getUserStats();
    if (result.success && result.data) {
      setStats(result.data as unknown as UserStats);
    }
  }, [hasManagePermission]);

  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      // SECURE: Use server-validated role update with audit logging
      const result = await secureAuthService.secureUpdateUserRole(
        selectedUser.id,
        newRole as UserRole,
        `Role changed from ${selectedUser.role} to ${newRole} via Admin UI`
      );

      if (!result.success) {
        throw new Error(result.error || 'Role update failed');
      }

      toast({
        title: 'Perfil atualizado',
        description: `Perfil de ${selectedUser.full_name || selectedUser.email} foi atualizado para ${getRoleInfo(newRole).label}.`,
      });

      await Promise.all([fetchUsers(), fetchStats()]);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar o perfil do usuário.',
        variant: 'destructive',
      });
    }
  };

  const createUser = async () => {
    const result = await UserManagementService.createUser(createForm);
    
    if (result.success) {
      toast({
        title: 'Usuário criado',
        description: `Usuário ${createForm.full_name} foi criado com sucesso.`,
      });
      
      // Reset form
      setCreateForm({
        email: '',
        password: '',
        full_name: '',
        role: 'citizen',
        phone: '',
        address: '',
        neighborhood: ''
      });
      
      setIsCreateDialogOpen(false);
      await Promise.all([fetchUsers(), fetchStats()]);
    } else {
      toast({
        title: 'Erro ao criar usuário',
        description: result.error || 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const inviteUser = async () => {
    const result = await UserManagementService.inviteUser(inviteForm);
    
    if (result.success) {
      toast({
        title: 'Convite enviado',
        description: `Convite foi enviado para ${inviteForm.email}.`,
      });
      
      // Reset form
      setInviteForm({
        email: '',
        role: 'citizen',
        full_name: '',
        phone: '',
        address: '',
        neighborhood: '',
        message: ''
      });
      
      setIsInviteDialogOpen(false);
    } else {
      toast({
        title: 'Erro ao enviar convite',
        description: result.error || 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async () => {
    if (!selectedUser) return;

    const result = await UserManagementService.toggleUserStatus(
      selectedUser.id,
      !selectedUser.is_active,
      selectedUser.is_active ? undefined : deactivationReason
    );

    if (result.success) {
      toast({
        title: selectedUser.is_active ? 'Usuário desabilitado' : 'Usuário reabilitado',
        description: `${selectedUser.full_name || selectedUser.email} foi ${selectedUser.is_active ? 'desabilitado' : 'reabilitado'}.`,
      });
      
      setIsDeactivateDialogOpen(false);
      setSelectedUser(null);
      setDeactivationReason('');
      await Promise.all([fetchUsers(), fetchStats()]);
    } else {
      toast({
        title: 'Erro ao alterar status',
        description: result.error || 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    // Filtro de busca por nome ou email
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de status ativo/inativo
    const matchesStatus = showInactiveUsers ? true : user.is_active !== false;
    
    return matchesSearch && matchesStatus;
  });

  // Filtra vice-presidentes para o componente de delegação
  const vicePresidents = users.filter(user => user.role === 'vice_presidente' && user.is_active !== false);

  useEffect(() => {
    const validatePermissions = async () => {
      setLoading(true);
      try {
        const hasPermission = await hasSecurePermission('profiles.manage');
        setHasManagePermission(hasPermission);
        
        // If user has permission, load data immediately
        if (hasPermission) {
          await Promise.all([fetchUsers(), fetchStats()]);
        }
      } catch (error) {
        console.error('Permission validation error:', error);
        setHasManagePermission(false);
      } finally {
        setLoading(false);
      }
    };
    
    validatePermissions();
  }, [hasSecurePermission, fetchUsers, fetchStats]);

  // Show loading while validating permissions and loading data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // SECURE: Block access if user doesn't have permission
  if (!hasManagePermission) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os perfis e permissões dos usuários do sistema.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Crie uma conta de usuário com acesso imediato ao sistema.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="create-name">Nome Completo *</Label>
                  <Input
                    id="create-name"
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm(prev => ({...prev, full_name: e.target.value}))}
                    placeholder="Nome completo do usuário"
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-email">Email *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({...prev, email: e.target.value}))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-password">Senha *</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({...prev, password: e.target.value}))}
                    placeholder="Senha temporária"
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-role">Perfil *</Label>
                  <Select value={createForm.role} onValueChange={(value) => setCreateForm(prev => ({...prev, role: value as UserRole}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {role.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="create-phone">Telefone</Label>
                  <Input
                    id="create-phone"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm(prev => ({...prev, phone: e.target.value}))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={createUser}
                    disabled={!createForm.email || !createForm.password || !createForm.full_name}
                  >
                    Criar Usuário
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Enviar Convite
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Convidar Usuário</DialogTitle>
                <DialogDescription>
                  Envie um convite por email para que o usuário crie sua própria conta.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-name">Nome Completo *</Label>
                  <Input
                    id="invite-name"
                    value={inviteForm.full_name}
                    onChange={(e) => setInviteForm(prev => ({...prev, full_name: e.target.value}))}
                    placeholder="Nome completo do usuário"
                  />
                </div>
                
                <div>
                  <Label htmlFor="invite-email">Email *</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({...prev, email: e.target.value}))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="invite-role">Perfil *</Label>
                  <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({...prev, role: value as UserRole}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {role.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="invite-message">Mensagem personalizada</Label>
                  <Textarea
                    id="invite-message"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({...prev, message: e.target.value}))}
                    placeholder="Adicione uma mensagem personalizada ao convite..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={inviteUser}
                    disabled={!inviteForm.email || !inviteForm.full_name}
                  >
                    Enviar Convite
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                  <p className="text-sm text-muted-foreground">Usuários Inativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.recent_registrations}</p>
                  <p className="text-sm text-muted-foreground">Novos (30 dias)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Componente de Delegação de Presidência - apenas para presidentes */}
      {profile?.role === 'presidente' && vicePresidents.length > 0 && (
        <PresidencyDelegation 
          vicePresidents={vicePresidents}
          onDelegationChange={async () => {
            await Promise.all([fetchUsers(), fetchStats()]);
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários do Sistema
          </CardTitle>
          <CardDescription>
            {showInactiveUsers 
              ? `${users.length} usuários cadastrados (incluindo ${users.filter(u => u.is_active === false).length} inativos)`
              : `${users.filter(u => u.is_active !== false).length} usuários ativos de ${users.length} total`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Button
              variant={showInactiveUsers ? "default" : "outline"}
              size="sm"
              onClick={() => setShowInactiveUsers(!showInactiveUsers)}
              className="flex items-center gap-2"
            >
              {showInactiveUsers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showInactiveUsers ? 'Ocultar Inativos' : 'Mostrar Inativos'}
            </Button>
          </div>

          {/* Users list */}
          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              const RoleIcon = roleInfo.icon;
              
              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{user.full_name || 'Nome não informado'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {!user.is_active && (
                          <p className="text-xs text-red-600">
                            Desabilitado: {user.deactivation_reason || 'Sem motivo especificado'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!user.is_active && (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                    
                    <Badge variant={roleInfo.color as "default" | "secondary" | "destructive" | "outline"} className="flex items-center gap-1">
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </Badge>
                    
                    {/* Edit Role Dialog */}
                    <Dialog open={isEditDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setIsEditDialogOpen(open);
                      if (!open) {
                        setSelectedUser(null);
                        setNewRole('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Perfil do Usuário</DialogTitle>
                          <DialogDescription>
                            Altere o perfil de acesso para {user.full_name || user.email}.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="newRole">Novo Perfil</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um perfil" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => {
                                  const Icon = role.icon;
                                  return (
                                    <SelectItem key={role.value} value={role.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {role.label}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditDialogOpen(false);
                                setSelectedUser(null);
                                setNewRole('');
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={updateUserRole}>
                              Salvar Alterações
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Deactivate/Reactivate Dialog */}
                    <Dialog open={isDeactivateDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setIsDeactivateDialogOpen(open);
                      if (!open) {
                        setSelectedUser(null);
                        setDeactivationReason('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant={user.is_active ? "destructive" : "default"}
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeactivateDialogOpen(true);
                          }}
                        >
                          {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {user.is_active ? 'Desabilitar' : 'Reabilitar'} Usuário
                          </DialogTitle>
                          <DialogDescription>
                            {user.is_active 
                              ? `Desabilitar conta de ${user.full_name || user.email}. O usuário não conseguirá mais acessar o sistema.`
                              : `Reabilitar conta de ${user.full_name || user.email}. O usuário poderá acessar o sistema novamente.`
                            }
                          </DialogDescription>
                        </DialogHeader>
                        
                        {user.is_active && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="deactivationReason">Motivo da desabilitação</Label>
                              <Textarea
                                id="deactivationReason"
                                value={deactivationReason}
                                onChange={(e) => setDeactivationReason(e.target.value)}
                                placeholder="Informe o motivo para desabilitar este usuário..."
                                rows={3}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsDeactivateDialogOpen(false);
                              setSelectedUser(null);
                              setDeactivationReason('');
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            variant={user.is_active ? "destructive" : "default"}
                            onClick={toggleUserStatus}
                          >
                            {user.is_active ? 'Desabilitar' : 'Reabilitar'} Usuário
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? `Nenhum usuário encontrado com os termos da busca${!showInactiveUsers ? ' (apenas usuários ativos)' : ''}.`
                : !showInactiveUsers 
                  ? 'Nenhum usuário ativo encontrado.'
                  : 'Nenhum usuário cadastrado.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;