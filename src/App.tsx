import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { createNavigationConfig } from "@/config/navigation";
import { UserRole, NavigationItem } from "@/types/navigation";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Reports from "./pages/Reports";
import CreateReport from "./pages/CreateReport";
import Reunioes from "./pages/Reunioes";
import Documentos from "./pages/Documentos";
import Profile from "./pages/Profile";
import AuthPage from "./components/AuthPage";
import NotFound from "./pages/NotFound";
// CODEMA Pages
import CouncillorsPage from "./pages/codema/conselheiros";
import CreateCouncillorPage from "./pages/codema/conselheiros/create";
import EditCouncillorPage from "./pages/codema/conselheiros/edit";
import ViewCouncillorPage from "./pages/codema/conselheiros/view";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  // If user is logged in and tries to access auth page, redirect to dashboard
  if (user && window.location.pathname === "/auth") {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  
  
  // Create navigation configuration based on authentication state
  const navigationConfig = createNavigationConfig(
    !!user,
    profile?.role as UserRole,
    user ? 'sidebar' : 'horizontal'
  );
  
  // Handle navigation item click
  const handleNavigationItemClick = (item: NavigationItem) => {
    if (item.id === 'logout') {
      // Handle logout special case
      window.location.href = '/auth';
    }
    // Other navigation is handled by the routing system
  };
  
  return (
    <div className="min-h-screen bg-background">
      <NavigationProvider config={navigationConfig}>
        <AccessibilityProvider
          enableKeyboardShortcuts={true}
          enableFocusTrapping={false}
          enableScreenReaderAnnouncements={true}
        >
          {user ? (
            // Authenticated layout with sidebar
            <div className="min-h-screen flex w-full">
              <aside className="w-64 border-r bg-card">
                <UnifiedNavigation
                  config={navigationConfig}
                  onItemClick={handleNavigationItemClick}
                  className="h-full p-4"
                />
              </aside>
              <main className="flex-1">
                <header className="h-16 flex items-center border-b bg-card px-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">C</span>
                    </div>
                    <div className="font-bold text-xl text-foreground">
                      Portal Municipal - Itanhomi
                    </div>
                  </div>
                  <div className="ml-auto flex items-center space-x-4">
                    <div className="hidden md:flex flex-col text-right">
                      <span className="text-sm font-medium text-foreground">
                        {profile?.full_name || user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {profile?.role === 'admin' ? 'Administrador' :
                         profile?.role === 'secretario' ? 'Secretário' :
                         profile?.role === 'presidente' ? 'Presidente' :
                         profile?.role === 'conselheiro_titular' ? 'Conselheiro Titular' :
                         profile?.role === 'conselheiro_suplente' ? 'Conselheiro Suplente' :
                         profile?.role === 'moderator' ? 'Moderador' : 'Cidadão'}
                      </span>
                    </div>
                  </div>
                </header>
                <div className="flex-1" id="main-content">
                  {children}
                </div>
              </main>
            </div>
          ) : (
            // Public layout with horizontal navigation
            <div className="min-h-screen">
              <header className="bg-gradient-to-r from-primary via-primary-glow to-secondary shadow-lg">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">
                        CODEMA Itanhomi
                      </h1>
                      <p className="text-white/80 text-sm">Conselho de Defesa do Meio Ambiente</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <UnifiedNavigation
                      config={navigationConfig}
                      onItemClick={handleNavigationItemClick}
                      className="hidden md:flex"
                    />
                  </div>
                </div>
              </header>
              <main id="main-content">
                {children}
              </main>
            </div>
          )}
        </AccessibilityProvider>
      </NavigationProvider>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/auth" element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/criar-relatorio" element={
                <ProtectedRoute>
                  <CreateReport />
                </ProtectedRoute>
              } />
              <Route path="/reunioes" element={
                <ProtectedRoute>
                  <Reunioes />
                </ProtectedRoute>
              } />
              <Route path="/documentos" element={
                <ProtectedRoute>
                  <Documentos />
                </ProtectedRoute>
              } />
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* CODEMA Routes */}
              <Route path="/codema/conselheiros" element={
                <ProtectedRoute>
                  <CouncillorsPage />
                </ProtectedRoute>
              } />
              <Route path="/codema/conselheiros/create" element={
                <ProtectedRoute>
                  <CreateCouncillorPage />
                </ProtectedRoute>
              } />
              <Route path="/codema/conselheiros/:id/edit" element={
                <ProtectedRoute>
                  <EditCouncillorPage />
                </ProtectedRoute>
              } />
              <Route path="/codema/conselheiros/:id/view" element={
                <ProtectedRoute>
                  <ViewCouncillorPage />
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
