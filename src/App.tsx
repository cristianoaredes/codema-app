import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
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
import AuthPage from "./components/AuthPage";
import NotFound from "./pages/NotFound";

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
  const { user } = useAuth();
  
  if (!user) {
    // Public layout without sidebar
    return (
      <div className="min-h-screen bg-background">
        <Header />
        {children}
      </div>
    );
  }
  
  // Authenticated layout with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-16 flex items-center border-b bg-card px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1">
              <Header />
            </div>
          </header>
          <div className="flex-1">
            {children}
          </div>
        </main>
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
              <Route path="/processos" element={
                <ProtectedRoute>
                  <Processos />
                </ProtectedRoute>
              } />
              <Route path="/fma" element={
                <ProtectedRoute>
                  <FMA />
                </ProtectedRoute>
              } />
              <Route path="/ouvidoria" element={
                <ProtectedRoute>
                  <Ouvidoria />
                </ProtectedRoute>
              } />
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Profile />
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
