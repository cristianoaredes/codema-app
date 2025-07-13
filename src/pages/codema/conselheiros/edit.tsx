import { useParams, useNavigate } from "react-router-dom";
import { useCouncillor, useUpdateCouncillor } from "@/hooks/codema/useCouncillors";
import { CouncillorForm } from "./components/CouncillorForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCouncillorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: councillor, isLoading } = useCouncillor(id!);
  const updateCouncillor = useUpdateCouncillor();

  const handleSubmit = (values: any) => {
    updateCouncillor.mutate(
      { id: id!, councillor: values },
      {
        onSuccess: () => {
          navigate('/codema/conselheiros');
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-32 mb-6" />
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!councillor) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Conselheiro não encontrado</p>
          <Button
            variant="link"
            onClick={() => navigate('/codema/conselheiros')}
            className="mt-4"
          >
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/codema/conselheiros')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Editar Conselheiro</CardTitle>
          <CardDescription>
            Atualize os dados do conselheiro {councillor.nome}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouncillorForm
            councillor={councillor}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/codema/conselheiros')}
            isSubmitting={updateCouncillor.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}