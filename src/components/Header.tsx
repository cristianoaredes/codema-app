import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CityReport</h1>
              <p className="text-sm text-muted-foreground">Municipal Service Portal</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              My Reports
            </Button>
            <Button variant="outline" size="sm">
              Help
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;