import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { useToast } from '@/hooks';
import { Users, Search, Edit, Shield, UserCheck, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const { hasAdminAccess } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const roles = [
    { value: 'citizen', label: 'Cidadão', icon: User, color: 'secondary' },
    { value: 'conselheiro_suplente', label: 'Conselheiro Suplente', icon: UserCheck, color: 'outline' },
    { value: 'conselheiro_titular', label: 'Conselheiro Titular', icon: UserCheck, color: 'default' },
    { value: 'secretario', label: 'Secretário', icon: Users, color: 'default' },
    { value: 'presidente', label: 'Presidente', icon: Shield, color: 'default' },
    { value: 'moderator', label: 'Moderador', icon: Shield, color: 'outline' },
    { value: 'admin', label: 'Administrador', icon: Shield, color: 'destructive' },
  ] as const;

  const getRoleInfo = (role: string) => {
    return roles.find(r => r.value === role) || roles[0];
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', selectedUser.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Perfil atualizado',
        description: `Perfil de ${selectedUser.full_name || selectedUser.email} foi atualizado para ${getRoleInfo(newRole).label}.`,
      });

      // Refresh users list
      await fetchUsers();
      setIsDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: 'Não foi possível atualizar o perfil do usuário.',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (hasAdminAccess) {
      fetchUsers();
    }
  }, [hasAdminAccess]);

  if (!hasAdminAccess) {
    return null; // This should be handled by ProtectedRoute
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os perfis e permissões dos usuários do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários do Sistema
          </CardTitle>
          <CardDescription>
            {users.length} usuários cadastrados
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
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
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={roleInfo.color as "default" | "secondary" | "destructive" | "outline"} className="flex items-center gap-1">
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </Badge>
                    
                    <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
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
                            setIsDialogOpen(true);
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
                                setIsDialogOpen(false);
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
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum usuário encontrado com os termos da busca.' : 'Nenhum usuário cadastrado.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;