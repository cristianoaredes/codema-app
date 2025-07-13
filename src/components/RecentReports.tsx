import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  statusStyles,
  priorityStyles,
  spacingClasses,
  typographyClasses,
  cardVariants,
  iconSizes,
  animationClasses
} from "@/styles/component-styles";

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

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'open',
      'in-progress': 'in_progress',
      'resolved': 'resolved'
    };
    
    const mappedStatus = statusMap[status] || 'closed';
    const styles = statusStyles.report[mappedStatus as keyof typeof statusStyles.report] || statusStyles.report.closed;
    
    switch (status) {
      case "pending":
        return {
          styles,
          label: "Pendente",
          description: "Aguardando análise da equipe municipal"
        };
      case "in-progress":
        return {
          styles,
          label: "Em Andamento",
          description: "Sendo trabalhado pela equipe municipal"
        };
      case "resolved":
        return {
          styles,
          label: "Resolvido",
          description: "Problema foi solucionado"
        };
      default:
        return {
          styles,
          label: "Desconhecido",
          description: "Status não definido"
        };
    }
  };

  const getPriorityInfo = (priority: string) => {
    const styles = priorityStyles[priority as keyof typeof priorityStyles] || priorityStyles.low;
    
    switch (priority) {
      case "urgent":
        return {
          styles,
          label: "Urgente",
          description: "Requer ação imediata"
        };
      case "high":
        return {
          styles,
          label: "Alta",
          description: "Problema importante"
        };
      case "medium":
        return {
          styles,
          label: "Média",
          description: "Prioridade normal"
        };
      case "low":
        return {
          styles,
          label: "Baixa",
          description: "Problema menor"
        };
      default:
        return {
          styles,
          label: "Não definida",
          description: "Prioridade não especificada"
        };
    }
  };

  return (
    <section
      className={`${spacingClasses.section.marginBottom} bg-muted/30`}
      aria-labelledby="recent-reports-title"
    >
      <div className={`${spacingClasses.container.maxWidth} ${spacingClasses.container.padding}`}>
        <header className={`text-center ${spacingClasses.header.marginBottom}`}>
          <h2
            id="recent-reports-title"
            className={`${typographyClasses.pageTitle} ${spacingClasses.content.gap}`}
          >
            Relatórios Recentes da Comunidade
          </h2>
          <p className={`${typographyClasses.pageSubtitle} max-w-2xl mx-auto`}>
            Veja os problemas que seus vizinhos estão relatando e acompanhe o progresso dos serviços municipais
          </p>
        </header>
        
        <div className="max-w-6xl mx-auto">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${spacingClasses.section.gap}`}
            role="list"
            aria-label="Lista de relatórios recentes"
          >
            {reports.map((report) => {
              const statusInfo = getStatusInfo(report.status);
              const priorityInfo = getPriorityInfo(report.priority);
              
              return (
                <article
                  key={report.id}
                  role="listitem"
                  className="focus-within:outline-none focus-within:ring-2 focus-within:ring-ring rounded-lg"
                >
                  <Card className={`${cardVariants.listItem} ${animationClasses.fadeIn} h-full`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                          {report.title}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full border"
                          style={priorityInfo.styles}
                          aria-label={`Prioridade: ${priorityInfo.label} - ${priorityInfo.description}`}
                        >
                          {priorityInfo.label}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm text-muted-foreground">
                        {report.category}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
                        <span aria-label={`Localização: ${report.location}`}>
                          {report.location}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge
                          className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full border"
                          style={statusInfo.styles}
                          aria-label={`Status: ${statusInfo.label} - ${statusInfo.description}`}
                        >
                          {statusInfo.label}
                        </Badge>
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                          <time aria-label={`Reportado ${report.timeAgo}`}>
                            {report.timeAgo}
                          </time>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border">
                        <User className="w-3 h-3 mr-1" aria-hidden="true" />
                        <span aria-label={`Reportado por ${report.submittedBy}`}>
                          Reportado por {report.submittedBy}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              );
            })}
          </div>
          
          <footer className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Mostrando relatórios recentes da sua comunidade •
              <Button
                variant="link"
                className="text-primary p-0 h-auto text-sm font-normal ml-1"
                aria-label="Ver todos os relatórios da comunidade"
              >
                Ver todos os relatórios
                <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
              </Button>
            </p>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default RecentReports;