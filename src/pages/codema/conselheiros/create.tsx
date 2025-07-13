import { useNavigate } from "react-router-dom";
import { useCreateCouncillor } from "@/hooks/codema/useCouncillors";
import { CouncillorForm } from "./components/CouncillorForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateCouncillorPage() {
  const navigate = useNavigate();
  const createCouncillor = useCreateCouncillor();

  const handleSubmit = (values: any) => {
    const councillorData = {
      ...values,
      faltas_consecutivas: 0,
      impedimentos: values.impedimentos || []
    };
    
    createCouncillor.mutate(councillorData, {
      onSuccess: () => {
        navigate('/codema/conselheiros');
      }
    });
  };

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
          <CardTitle>Cadastrar Novo Conselheiro</CardTitle>
          <CardDescription>
            Preencha os dados do novo membro do Conselho Municipal de Defesa do Meio Ambiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouncillorForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/codema/conselheiros')}
            isSubmitting={createCouncillor.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}