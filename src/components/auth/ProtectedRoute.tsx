import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Users, UserCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: Array<'citizen' | 'admin' | 'moderator' | 'conselheiro_titular' | 'conselheiro_suplente' | 'secretario' | 'presidente'>;
  requireCODEMAAccess?: boolean;
  requireAdminAccess?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requireCODEMAAccess = false,
  requireAdminAccess = false,
}) => {
  const { user, profile, loading, hasCODEMAAccess, hasAdminAccess } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (user && profile) {
    // Check specific roles
    if (requiredRoles.length > 0 && !requiredRoles.includes(profile.role)) {
      return <AccessDenied requiredRoles={requiredRoles} userRole={profile.role} />;
    }

    // Check CODEMA access
    if (requireCODEMAAccess && !hasCODEMAAccess) {
      return <AccessDenied requireCODEMAAccess />;
    }

    // Check admin access
    if (requireAdminAccess && !hasAdminAccess) {
      return <AccessDenied requireAdminAccess />;
    }
  }

  return <>{children}</>;
};

interface AccessDeniedProps {
  requiredRoles?: Array<string>;
  userRole?: string;
  requireCODEMAAccess?: boolean;
  requireAdminAccess?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRoles,
  userRole,
  requireCODEMAAccess,
  requireAdminAccess,
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'conselheiro_titular':
      case 'conselheiro_suplente':
        return <UserCheck className="w-4 h-4" />;
      case 'secretario':
      case 'presidente':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'conselheiro_titular':
        return 'Conselheiro Titular';
      case 'conselheiro_suplente':
        return 'Conselheiro Suplente';
      case 'secretario':
        return 'Secretário';
      case 'presidente':
        return 'Presidente';
      case 'moderator':
        return 'Moderador';
      case 'citizen':
        return 'Cidadão';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {userRole && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Seu perfil atual:</p>
              <Badge variant="outline" className="text-sm">
                {getRoleIcon(userRole)}
                <span className="ml-1">{getRoleLabel(userRole)}</span>
              </Badge>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {requireAdminAccess && "Esta página requer acesso administrativo."}
              {requireCODEMAAccess && "Esta página requer acesso ao CODEMA."}
              {requiredRoles && requiredRoles.length > 0 && "Esta página requer um dos seguintes perfis:"}
            </p>
            
            {requiredRoles && requiredRoles.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {requiredRoles.map((role) => (
                  <Badge key={role} variant="default" className="text-xs">
                    {getRoleIcon(role)}
                    <span className="ml-1">{getRoleLabel(role)}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              Entre em contato com o administrador do sistema para solicitar as permissões necessárias.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};