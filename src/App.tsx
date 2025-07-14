import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/Navigation/AppSidebar";
import { Header } from "@/components/common";
import { SmartBreadcrumb, BreadcrumbContainer } from "@/components/navigation/SmartBreadcrumb";
import { GlobalSearch, SearchTrigger } from "@/components/navigation/GlobalSearch";
import { CommandPalette, useCommandPalette } from "@/components/ui/command-palette";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Reports from "./pages/Reports";
import CreateReport from "./pages/CreateReport";
import Reunioes from "./pages/Reunioes";
import Documentos from "./pages/Documentos";
import Processos from "./pages/Processos";
import FMA from "./pages/FMA";
import Ouvidoria from "./pages/Ouvidoria";
import Profile from "./pages/Profile";
import ConselheirosPage from "./pages/codema/conselheiros";
import AtasPage from "./pages/codema/atas";
import ResolucoesPage from "./pages/codema/resolucoes";
import AuditoriaPage from "./pages/codema/auditoria";
import UserManagement from "./pages/admin/UserManagement";
import { AuthPage, ProtectedRoute } from "@/components/auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user is logged in and tries to access auth page, redirect to dashboard
  if (user && window.location.pathname === "/auth") {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const commandPalette = useCommandPalette();
  
  if (!user) {
    // Public layout without sidebar
    return (
      <div className="min-h-screen bg-background">
        <Header />
        {children}
      </div>
    );
  }
  
  // Authenticated layout with sidebar, breadcrumbs, and search
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden">
          {/* Enhanced Header with Search */}
          <header className="h-16 flex items-center border-b bg-card px-4 sm:px-6 sticky top-0 z-20">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1 flex items-center justify-between">
              <div className="flex-1">
                <Header />
              </div>
              <div className="flex items-center gap-4">
                {/* Global Search */}
                <GlobalSearch 
                  variant="inline" 
                  placeholder="Pesquisar relatórios, atas, reuniões..."
                  className="w-80 hidden md:block"
                />
                {/* Search trigger for mobile */}
                <SearchTrigger 
                  onClick={commandPalette.toggle}
                  className="md:hidden"
                />
              </div>
            </div>
          </header>

          {/* Breadcrumb Navigation */}
          <BreadcrumbContainer>
            <SmartBreadcrumb />
          </BreadcrumbContainer>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>

        {/* Command Palette */}
        <CommandPalette 
          open={commandPalette.open} 
          onOpenChange={commandPalette.setOpen}
        />
      </div>
    </SidebarProvider>
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
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdminAccess>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdminAccess>
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              {/* General Routes */}
              <Route path="/criar-relatorio" element={
                <ProtectedRoute>
                  <CreateReport />
                </ProtectedRoute>
              } />
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Municipal Services */}
              <Route path="/reunioes" element={
                <ProtectedRoute requireCODEMAAccess>
                  <Reunioes />
                </ProtectedRoute>
              } />
              <Route path="/documentos" element={
                <ProtectedRoute requireCODEMAAccess>
                  <Documentos />
                </ProtectedRoute>
              } />
              <Route path="/processos" element={
                <ProtectedRoute requireCODEMAAccess>
                  <Processos />
                </ProtectedRoute>
              } />
              <Route path="/fma" element={
                <ProtectedRoute requireCODEMAAccess>
                  <FMA />
                </ProtectedRoute>
              } />
              <Route path="/ouvidoria" element={
                <ProtectedRoute>
                  <Ouvidoria />
                </ProtectedRoute>
              } />
              
              {/* CODEMA Specific Modules */}
              <Route path="/codema/conselheiros" element={
                <ProtectedRoute requireAdminAccess>
                  <ConselheirosPage />
                </ProtectedRoute>
              } />
              <Route path="/codema/atas" element={
                <ProtectedRoute requireCODEMAAccess>
                  <AtasPage />
                </ProtectedRoute>
              } />
              <Route path="/codema/resolucoes" element={
                <ProtectedRoute requireCODEMAAccess>
                  <ResolucoesPage />
                </ProtectedRoute>
              } />
              <Route path="/codema/auditoria" element={
                <ProtectedRoute requireAdminAccess>
                  <AuditoriaPage />
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
