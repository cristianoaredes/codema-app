import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User } from "lucide-react";

interface Report {
  id: string;
  title: string;
  category: string;
  location: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  submittedBy: string;
  timeAgo: string;
}

const RecentReports = () => {
  const reports: Report[] = [
    {
      id: "1",
      title: "Pothole on Main Street",
      category: "Street Maintenance",
      location: "Main St & 5th Ave",
      status: "in-progress",
      priority: "high",
      submittedBy: "Sarah M.",
      timeAgo: "2 hours ago"
    },
    {
      id: "2",
      title: "Broken Street Light",
      category: "Street Lighting",
      location: "Park Ave, Block 200",
      status: "pending",
      priority: "medium",
      submittedBy: "John D.",
      timeAgo: "4 hours ago"
    },
    {
      id: "3",
      title: "Overflowing Garbage Bin",
      category: "Garbage Collection",
      location: "Downtown Plaza",
      status: "resolved",
      priority: "medium",
      submittedBy: "Maria L.",
      timeAgo: "1 day ago"
    },
    {
      id: "4",
      title: "Water Leak in Park",
      category: "Water & Sewer",
      location: "Central Park East",
      status: "in-progress",
      priority: "urgent",
      submittedBy: "Robert K.",
      timeAgo: "6 hours ago"
    },
    {
      id: "5",
      title: "Damaged Playground Equipment",
      category: "Parks & Recreation",
      location: "Riverside Park",
      status: "pending",
      priority: "high",
      submittedBy: "Lisa W.",
      timeAgo: "8 hours ago"
    },
    {
      id: "6",
      title: "Bus Stop Bench Vandalized",
      category: "Public Transportation",
      location: "Transit Station #3",
      status: "resolved",
      priority: "low",
      submittedBy: "Mike T.",
      timeAgo: "2 days ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Recent Community Reports</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what issues your neighbors are reporting and track the progress of municipal services
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow duration-300 border-0 bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                      {report.title}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${getPriorityColor(report.priority)} text-xs shrink-0`}
                    >
                      {report.priority}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    {report.category}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    {report.location}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(report.status)} text-xs`}>
                      {report.status.replace('-', ' ')}
                    </Badge>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {report.timeAgo}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border">
                    <User className="w-3 h-3 mr-1" />
                    Reported by {report.submittedBy}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Showing recent reports from your community • 
              <span className="text-primary cursor-pointer hover:underline ml-1">View all reports</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentReports;