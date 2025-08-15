import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, AuthPage, ProtectedRoute, PublicRoute } from "@/components/auth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DemoModeProvider } from "@/components/demo/DemoModeProvider";
import { Header } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

// Eager load apenas para páginas de autenticação críticas
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Lazy load para páginas principais com preloading estratégico
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Lazy load para páginas de reuniões (módulo pesado)
const Profile = lazy(() => import("./pages/Profile"));
const Reunioes = lazy(() => import("./pages/Reunioes"));
const NovaReuniao = lazy(() => import("./pages/reunioes/NovaReuniao"));
const ReuniaoDetalhes = lazy(() => import("./pages/reunioes/ReuniaoDetalhes"));

// Lazy load para módulos
const FMA = lazy(() => import("./pages/fma/FMA"));
const ProjetoDetails = lazy(() => import("./pages/fma/ProjetoDetails"));
const Ouvidoria = lazy(() => import("./pages/ouvidoria").then(m => ({ default: m.Ouvidoria })));
const DenunciaDetails = lazy(() => import("./pages/ouvidoria/DenunciaDetails"));
const Documentos = lazy(() => import("./pages/documentos").then(m => ({ default: m.Documentos })));
const NovoDocumento = lazy(() => import("./pages/documentos/NovoDocumento"));
const Processos = lazy(() => import("./pages/processos").then(m => ({ default: m.Processos })));

// Lazy load para relatórios
const Reports = lazy(() => import("./pages/relatorios").then(m => ({ default: m.Reports })));
const CreateReport = lazy(() => import("./pages/relatorios").then(m => ({ default: m.CreateReport })));
const ReportDetails = lazy(() => import("./pages/relatorios/ReportDetails"));
const DashboardExecutivo = lazy(() => import("./pages/relatorios/DashboardExecutivo"));

// Lazy load para módulos CODEMA com preload estratégico
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

// Lazy load para arquivo digital
const ArquivoDigital = lazy(() => import("./pages/arquivo/ArquivoDigital"));

// Lazy load para mobile
const MobileSettings = lazy(() => import("./pages/mobile/MobileSettings"));

// Lazy load para páginas utilitárias
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Ajuda = lazy(() => import("./pages/Ajuda"));
const Documentacao = lazy(() => import("./pages/Documentacao"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Dados considerados frescos por 5 minutos
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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Content area with clean, modern layout */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
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
                <Route path="/" element={
                  <Suspense fallback={<PageLoader />}>
                    <Index />
                  </Suspense>
                } />
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
                <Route path="/dashboard-executivo" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <DashboardExecutivo />
                  </ProtectedRoute>
                } />
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
                <Route path="/fma/projeto/:id" element={<ProjetoDetails />} />
                <Route path="/ouvidoria" element={<Ouvidoria />} />
                <Route path="/ouvidoria/:id" element={<DenunciaDetails />} />
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
                <Route path="/arquivo-digital" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <ArquivoDigital />
                  </ProtectedRoute>
                } />
                <Route path="/mobile" element={
                  <ProtectedRoute requireCODEMAAccess>
                    <MobileSettings />
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