import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { HeroSection, ReportForm, RecentReports } from "@/components/dashboard";
import { ServiceRating } from "@/components/forms";

const Index = () => {
  const { user, loading } = useAuth();

  // If user is logged in, redirect to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ReportForm />
      <ServiceRating />
      <RecentReports />
      
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Portal Municipal Itanhemi - Construindo uma cidade melhor juntos.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
