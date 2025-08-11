import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, AuthPage, ProtectedRoute, PublicRoute } from "@/components/auth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DemoModeProvider } from "@/components/demo/DemoModeProvider";
import { AppSidebar } from "@/components/common/Navigation/AppSidebar";
import { Header } from "@/components/common";
import { SmartBreadcrumb } from '@/components/navigation/SmartBreadcrumb';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';
import { CommandPalette, useCommandPalette } from "@/components/ui/command-palette";
import { Skeleton } from "@/components/ui/skeleton";

// Eager load para páginas críticas
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Lazy load para páginas secundárias
const Profile = lazy(() => import("./pages/Profile"));
const Reunioes = lazy(() => import("./pages/Reunioes"));
const NovaReuniao = lazy(() => import("./pages/reunioes/NovaReuniao"));

// Lazy load para módulos
const FMA = lazy(() => import("./pages/fma/FMA"));
const Ouvidoria = lazy(() => import("./pages/ouvidoria").then(m => ({ default: m.Ouvidoria })));
const Documentos = lazy(() => import("./pages/documentos").then(m => ({ default: m.Documentos })));
const NovoDocumento = lazy(() => import("./pages/documentos/NovoDocumento"));
const Processos = lazy(() => import("./pages/processos").then(m => ({ default: m.Processos })));

// Lazy load para relatórios
const Reports = lazy(() => import("./pages/relatorios").then(m => ({ default: m.Reports })));
const CreateReport = lazy(() => import("./pages/relatorios").then(m => ({ default: m.CreateReport })));

// Lazy load para módulos CODEMA
const ConselheirosPage = lazy(() => import("./pages/codema/conselheiros"));
const AtasPage = lazy(() => import("./pages/codema/atas"));
const ResolucoesPage = lazy(() => import("./pages/codema/resolucoes"));
const AuditoriaPage = lazy(() => import("./pages/codema/auditoria"));
const GestaoProtocolos = lazy(() => import("./pages/codema/protocolos"));

// Lazy load para admin
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const DataSeeder = lazy(() => import("./pages/admin/DataSeeder"));
const Documentation = lazy(() => import("./pages/admin/Documentation"));

const queryClient = new QueryClient();

// Loading component para lazy loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="space-y-4 text-center">
      <Skeleton className="h-12 w-12 rounded-full mx-auto" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  </div>
);

const PublicLayout = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <Outlet />
  </div>
);

const AuthenticatedLayout = () => {
  const commandPalette = useCommandPalette();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar data-tour="sidebar" />
        <main className="flex-1 overflow-x-hidden relative">
          {/* Mobile-optimized header with better touch targets */}
          <header className="h-14 sm:h-16 flex items-center border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 px-3 sm:px-4 md:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="h-10 w-10 sm:h-10 sm:w-10 touch-manipulation" />
            </div>
            {/* Show breadcrumb on tablets and up */}
            <div className="hidden sm:flex items-center flex-1 ml-4">
              <SmartBreadcrumb />
            </div>
            {/* Mobile-optimized header actions */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <Header />
            </div>
          </header>

          {/* Content area with better mobile padding and safe areas for iOS */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-safe">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <CommandPalette open={commandPalette.open} onOpenChange={commandPalette.setOpen} />
        <MobileNavigation />
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
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/relatorios" element={
                  <Suspense fallback={<PageLoader />}>
                    <Reports />
                  </Suspense>
                } />
              </Route>
              <Route path="/auth" element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              } />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
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
                <Route path="/reunioes/nova" element={<NovaReuniao />} />
                <Route path="/documentos" element={<Documentos />} />
                <Route path="/documentos/novo" element={<NovoDocumento />} />
                <Route path="/processos" element={<Processos />} />
                <Route path="/fma" element={<FMA />} />
                <Route path="/ouvidoria" element={<Ouvidoria />} />
                <Route path="/codema/conselheiros" element={<ConselheirosPage />} />
                <Route path="/codema/atas" element={<AtasPage />} />
                <Route path="/codema/resolucoes" element={<ResolucoesPage />} />
                <Route path="/codema/auditoria" element={<AuditoriaPage />} />
                <Route path="/codema/protocolos" element={<GestaoProtocolos />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DemoModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;