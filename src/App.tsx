import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, AuthPage, ProtectedRoute, PublicRoute } from "@/components/auth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DemoModeProvider } from "@/components/demo/DemoModeProvider";
import { AppSidebar } from "@/components/common/Navigation/AppSidebar";
import { Header } from "@/components/common";
import { SmartBreadcrumb, BreadcrumbContainer } from "@/components/navigation/SmartBreadcrumb";
import { GlobalSearch, SearchTrigger } from "@/components/navigation/GlobalSearch";
import { CommandPalette, useCommandPalette } from "@/components/ui/command-palette";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateReport from "./pages/CreateReport";
import Reports from "./pages/Reports";
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
import GestaoProtocolos from "./pages/codema/protocolos/GestaoProtocolos";
import UserManagement from "./pages/admin/UserManagement";
import DataSeeder from "./pages/admin/DataSeeder";
import Documentation from "./pages/admin/Documentation";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout para páginas públicas (sem sidebar)
const PublicLayout = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <Outlet />
  </div>
);

// Layout para páginas autenticadas (com sidebar)
const AuthenticatedLayout = () => {
  const commandPalette = useCommandPalette();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar data-tour="sidebar" />
        <main className="flex-1 overflow-x-hidden">
          <header className="h-16 flex items-center border-b bg-card px-4 sm:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <SearchTrigger onClick={commandPalette.toggle} className="md:hidden" />
            </div>
            <div className="hidden md:flex items-center flex-1 ml-4">
              <SmartBreadcrumb />
            </div>
            <div className="flex items-center gap-4">
              <SearchTrigger onClick={commandPalette.toggle} />
              <Header /> {/* User profile button */}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>
        </main>
        <CommandPalette open={commandPalette.open} onOpenChange={commandPalette.setOpen} />
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DemoModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas Públicas */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/relatorios" element={<Reports />} />
              </Route>

              {/* Rota de Autenticação (sem layout principal) */}
              <Route path="/auth" element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              } />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              
              {/* Rotas Protegidas com Layout Autenticado */}
              <Route element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/data-seeder" element={<DataSeeder />} />
                <Route path="/admin/documentation" element={<Documentation />} />
                <Route path="/criar-relatorio" element={<CreateReport />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/reunioes" element={<Reunioes />} />
                <Route path="/documentos" element={<Documentos />} />
                <Route path="/processos" element={<Processos />} />
                <Route path="/fma" element={<FMA />} />
                <Route path="/ouvidoria" element={<Ouvidoria />} />
                <Route path="/codema/conselheiros" element={<ConselheirosPage />} />
                <Route path="/codema/atas" element={<AtasPage />} />
                <Route path="/codema/resolucoes" element={<ResolucoesPage />} />
                <Route path="/codema/auditoria" element={<AuditoriaPage />} />
                <Route path="/codema/protocolos" element={<GestaoProtocolos />} />
              </Route>
              
              {/* Rota de Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DemoModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
