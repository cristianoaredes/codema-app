import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ReportForm from "@/components/ReportForm";
import ServiceRating from "@/components/ServiceRating";
import RecentReports from "@/components/RecentReports";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ReportForm />
      <ServiceRating />
      <RecentReports />
      
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 CityReport - Municipal Service Portal. Helping build better communities together.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
