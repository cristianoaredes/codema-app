import { Button } from "@/components/ui/button";
import { FileText, Star, AlertTriangle } from "lucide-react";
import heroImage from "@/assets/municipal-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-background to-muted py-20">
      <div className="absolute inset-0 opacity-10">
        <img 
          src={heroImage} 
          alt="Municipal building" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Help Improve Your
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Community</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Report municipal service issues and rate the quality of public services in your area. 
            Your voice matters in building a better community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              <FileText className="w-5 h-5 mr-2" />
              Report an Issue
            </Button>
            
            <Button variant="municipal" size="lg" className="text-lg px-8 py-4">
              <Star className="w-5 h-5 mr-2" />
              Rate Services
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Quick Reporting</h3>
              <p className="text-muted-foreground">Report issues with photos and location details in seconds</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Service Rating</h3>
              <p className="text-muted-foreground">Rate and review municipal services to help improve quality</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Track Progress</h3>
              <p className="text-muted-foreground">Follow up on your reports and see resolution status</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;