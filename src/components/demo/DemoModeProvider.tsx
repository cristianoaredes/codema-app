import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Info, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface DemoModeContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  toggleDemoMode: () => void;
  simulateRole: (role: string) => void;
  simulatedRole: string | null;
}

const DemoModeContext = React.createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = React.useState(false);
  const [simulatedRole, setSimulatedRole] = React.useState<string | null>(null);
  const { profile } = useAuth();

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('demo-mode-enabled', 'true');
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    setSimulatedRole(null);
    localStorage.removeItem('demo-mode-enabled');
  };

  const toggleDemoMode = () => {
    if (isDemoMode) {
      disableDemoMode();
    } else {
      enableDemoMode();
    }
  };

  const simulateRole = (role: string) => {
    setSimulatedRole(role);
  };

  React.useEffect(() => {
    const savedDemoMode = localStorage.getItem('demo-mode-enabled');
    if (savedDemoMode === 'true') {
      setIsDemoMode(true);
    }
  }, []);

  return (
    <DemoModeContext.Provider value={{
      isDemoMode,
      enableDemoMode,
      disableDemoMode,
      toggleDemoMode,
      simulateRole,
      simulatedRole
    }}>
      {children}
      {isDemoMode && <DemoModeIndicator />}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = React.useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

function DemoModeIndicator() {
  const { isDemoMode, disableDemoMode, simulateRole, simulatedRole } = useDemoMode();
  const { profile } = useAuth();
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!isDemoMode) return null;

  const currentRole = simulatedRole || profile?.role || 'citizen';
  const availableRoles = [
    { id: 'citizen', label: 'Cidadão', description: 'Acesso básico para relatórios' },
    { id: 'conselheiro_titular', label: 'Conselheiro Titular', description: 'Membro ativo do CODEMA' },
    { id: 'conselheiro_suplente', label: 'Conselheiro Suplente', description: 'Membro suplente do CODEMA' },
    { id: 'secretario', label: 'Secretário', description: 'Secretário executivo do CODEMA' },
    { id: 'presidente', label: 'Presidente', description: 'Presidente do CODEMA' },
    { id: 'admin', label: 'Administrador', description: 'Acesso completo ao sistema' }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 border-orange-200 bg-orange-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm text-orange-800">
                Modo Demonstração
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-100"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={disableDemoMode}
                className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-100"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-orange-700">
            Explorando funcionalidades como: <Badge variant="outline" className="text-orange-800">
              {availableRoles.find(r => r.id === currentRole)?.label}
            </Badge>
          </CardDescription>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-800">
                  Simule diferentes roles para explorar todas as funcionalidades
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-orange-800">Simular Role:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map((role) => (
                    <Button
                      key={role.id}
                      variant={currentRole === role.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => simulateRole(role.id)}
                      className={cn(
                        "justify-start h-auto p-2 text-xs",
                        currentRole === role.id 
                          ? "bg-orange-600 text-white hover:bg-orange-700" 
                          : "border-orange-200 text-orange-800 hover:bg-orange-100"
                      )}
                      title={role.description}
                    >
                      <User className="h-3 w-3 mr-1" />
                      {role.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  ⚠️ Modo demonstração: Alguns recursos podem ter limitações
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Hook to get effective role (considering demo mode)
export function useEffectiveRole() {
  const { simulatedRole } = useDemoMode();
  const { profile } = useAuth();
  
  return simulatedRole || profile?.role || 'citizen';
}

// Hook to check if user has access in demo mode
export function useEffectivePermissions() {
  const effectiveRole = useEffectiveRole();
  const { isDemoMode } = useDemoMode();
  
  const hasAdminAccess = effectiveRole === 'admin' || (isDemoMode && effectiveRole === 'admin');
  const hasCODEMAAccess = ['conselheiro_titular', 'conselheiro_suplente', 'secretario', 'presidente', 'admin'].includes(effectiveRole);
  
  return {
    hasAdminAccess,
    hasCODEMAAccess,
    effectiveRole
  };
}