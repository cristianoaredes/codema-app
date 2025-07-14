import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  currentRating: number;
}

const ServiceRating = () => {
  const [selectedService, setSelectedService] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  
  const { toast } = useToast();

  const services: Service[] = [
    {
      id: "garbage",
      name: "Garbage Collection",
      description: "Regular waste pickup and recycling services",
      currentRating: 4.2
    },
    {
      id: "roads",
      name: "Road Maintenance",
      description: "Street repairs, pothole fixing, and road upkeep",
      currentRating: 3.8
    },
    {
      id: "parks",
      name: "Parks & Recreation",
      description: "Public parks, playgrounds, and recreational facilities",
      currentRating: 4.5
    },
    {
      id: "water",
      name: "Water Services",
      description: "Water supply, quality, and sewer maintenance",
      currentRating: 4.1
    },
    {
      id: "lighting",
      name: "Street Lighting",
      description: "Public lighting and electrical infrastructure",
      currentRating: 3.9
    },
    {
      id: "transport",
      name: "Public Transportation",
      description: "Bus services and public transit systems",
      currentRating: 3.7
    }
  ];

  const handleSubmitRating = () => {
    if (!selectedService || rating === 0) {
      toast({
        title: "Please complete your rating",
        description: "Select a service and provide a star rating.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Rating Submitted",
      description: "Thank you for your feedback! Your rating helps improve our services.",
    });

    // Reset form
    setSelectedService("");
    setRating(0);
    setReview("");
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = interactive 
        ? (hoveredRating || rating) >= starValue
        : currentRating >= starValue;
      
      return (
        <Star
          key={index}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            isFilled 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300 hover:text-yellow-400"
          }`}
          onClick={interactive ? () => setRating(starValue) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      );
    });
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Rate Municipal Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your experience with municipal services to help us improve quality and efficiency
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {services.map((service) => (
              <Card 
                key={service.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                  selectedService === service.id 
                    ? "border-primary shadow-md" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription className="text-sm">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(service.currentRating)}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {service.currentRating.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedService && (
            <Card className="shadow-lg border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-xl">
                  Rate: {services.find(s => s.id === selectedService)?.name}
                </CardTitle>
                <CardDescription>
                  How would you rate this service based on your recent experience?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Your Rating</h4>
                  <div className="flex items-center space-x-1">
                    {renderStars(0, true)}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {rating === 1 && "Poor - Needs significant improvement"}
                      {rating === 2 && "Fair - Below expectations"}
                      {rating === 3 && "Good - Meets basic expectations"}
                      {rating === 4 && "Very Good - Exceeds expectations"}
                      {rating === 5 && "Excellent - Outstanding service"}
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Additional Comments (Optional)
                  </h4>
                  <Textarea
                    placeholder="Share specific feedback about your experience..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleSubmitRating} className="w-full" size="lg">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Submit Rating
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceRating;