import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, AuthPage, ProtectedRoute, PublicRoute } from "@/components/auth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DemoModeProvider } from "@/components/demo/DemoModeProvider";
import { AppSidebar } from "@/components/common/Navigation/AppSidebar";
import { Header } from "@/components/common";
import { SmartBreadcrumb } from '@/components/navigation/SmartBreadcrumb';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';
import { Skeleton } from "@/components/ui/skeleton";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

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
const ReuniaoDetalhes = lazy(() => import("./pages/reunioes/ReuniaoDetalhes"));

// Lazy load para módulos
const FMA = lazy(() => import("./pages/fma/FMA"));
const Ouvidoria = lazy(() => import("./pages/ouvidoria").then(m => ({ default: m.Ouvidoria })));
const Documentos = lazy(() => import("./pages/documentos").then(m => ({ default: m.Documentos })));
const NovoDocumento = lazy(() => import("./pages/documentos/NovoDocumento"));
const Processos = lazy(() => import("./pages/processos").then(m => ({ default: m.Processos })));

// Lazy load para relatórios
const Reports = lazy(() => import("./pages/relatorios").then(m => ({ default: m.Reports })));
const CreateReport = lazy(() => import("./pages/relatorios").then(m => ({ default: m.CreateReport })));
const ReportDetails = lazy(() => import("./pages/relatorios/ReportDetails"));

// Lazy load para módulos CODEMA
const ConselheirosPage = lazy(() => import("./pages/codema/conselheiros"));
const ConselheiroDetails = lazy(() => import("./pages/codema/conselheiros/ConselheiroDetails"));
const AtasPage = lazy(() => import("./pages/codema/atas"));
const AtaDetails = lazy(() => import("./pages/codema/atas/AtaDetails"));
const NovaAta = lazy(() => import("./pages/codema/atas/NovaAta"));
const ResolucoesPage = lazy(() => import("./pages/codema/resolucoes"));
const ResolucaoDetails = lazy(() => import("./pages/codema/resolucoes/ResolucaoDetails"));
const AuditoriaPage = lazy(() => import("./pages/codema/auditoria"));
const GestaoProtocolos = lazy(() => import("./pages/codema/protocolos/index"));

// Lazy load para admin
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const DataSeeder = lazy(() => import("./pages/admin/DataSeeder"));
const Documentation = lazy(() => import("./pages/admin/Documentation"));

// Lazy load para páginas utilitárias
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Ajuda = lazy(() => import("./pages/Ajuda"));
const Documentacao = lazy(() => import("./pages/Documentacao"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Dados sempre considerados obsoletos
      refetchOnWindowFocus: true, // Refetch ao focar na janela
      retry: 1, // Reduzir tentativas para evitar cache de erros
    },
  },
});

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
  // Enable keyboard navigation
  useKeyboardNavigation();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar data-tour="sidebar" />
        <main className="flex-1 overflow-x-hidden relative">
          {/* Mobile-optimized header with better touch targets */}
          <header className="h-14 sm:h-16 flex items-center border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 px-3 sm:px-4 md:px-6">
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
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="codema-ui-theme">
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
                <Route path="/admin/users" element={
                  <ProtectedRoute requireAdminAccess>
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/data-seeder" element={
                  <ProtectedRoute requireAdminAccess>
                    <DataSeeder />
                  </ProtectedRoute>
                } />
                <Route path="/admin/documentation" element={
                  <ProtectedRoute requireAdminAccess>
                    <Documentation />
                  </ProtectedRoute>
                } />
                <Route path="/criar-relatorio" element={<CreateReport />} />
                <Route path="/relatorios/:id" element={<ReportDetails />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/reunioes" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <Reunioes />
                  </ProtectedRoute>
                } />
                <Route path="/reunioes/nova" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <NovaReuniao />
                  </ProtectedRoute>
                } />
                <Route path="/reunioes/:id" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <ReuniaoDetalhes />
                  </ProtectedRoute>
                } />
                <Route path="/documentos" element={<Documentos />} />
                <Route path="/documentos/novo" element={<NovoDocumento />} />
                <Route path="/processos" element={<Processos />} />
                <Route path="/fma" element={<FMA />} />
                <Route path="/ouvidoria" element={<Ouvidoria />} />
                <Route path="/codema/conselheiros" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <ConselheirosPage />
                  </ProtectedRoute>
                } />
                <Route path="/codema/conselheiros/:id" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <ConselheiroDetails />
                  </ProtectedRoute>
                } />
                <Route path="/codema/atas" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <AtasPage />
                  </ProtectedRoute>
                } />
                <Route path="/codema/atas/:id" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <AtaDetails />
                  </ProtectedRoute>
                } />
                <Route path="/codema/atas/nova" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <NovaAta />
                  </ProtectedRoute>
                } />
                <Route path="/codema/resolucoes" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <ResolucoesPage />
                  </ProtectedRoute>
                } />
                <Route path="/codema/resolucoes/:id" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <ResolucaoDetails />
                  </ProtectedRoute>
                } />
                <Route path="/codema/auditoria" element={
                  <ProtectedRoute requireAdminAccess>
                    <AuditoriaPage />
                  </ProtectedRoute>
                } />
                <Route path="/codema/protocolos" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <GestaoProtocolos />
                  </ProtectedRoute>
                } />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/ajuda" element={<Ajuda />} />
                <Route path="/documentacao" element={<Documentacao />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DemoModeProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;