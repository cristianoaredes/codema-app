import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCouncillors, useDeleteCouncillor } from "@/hooks/codema/useCouncillors";
import { CouncillorList } from "./components/CouncillorList";
import { MandateAlerts } from "./components/MandateAlerts";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Councillor } from "@/types/codema";

export default function CouncillorsPage() {
  const navigate = useNavigate();
  const { data: councillors, isLoading } = useCouncillors();
  const deleteCouncillor = useDeleteCouncillor();
  const [councillorToDelete, setCouncillorToDelete] = useState<string | null>(null);

  const handleEdit = (councillor: Councillor) => {
    navigate(`/codema/conselheiros/${councillor.id}/edit`);
  };

  const handleView = (councillor: Councillor) => {
    navigate(`/codema/conselheiros/${councillor.id}/view`);
  };

  const handleDelete = () => {
    if (councillorToDelete) {
      deleteCouncillor.mutate(councillorToDelete);
      setCouncillorToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const activeCouncillors = councillors?.filter(c => c.ativo) || [];
  const titularCount = activeCouncillors.filter(c => c.tipo === 'titular').length;
  const suplenteCount = activeCouncillors.filter(c => c.tipo === 'suplente').length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conselheiros do CODEMA</h1>
          <p className="text-muted-foreground">
            Gerencie os membros do Conselho Municipal de Defesa do Meio Ambiente
          </p>
        </div>
        <Button onClick={() => navigate('/codema/conselheiros/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Conselheiro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Total de Conselheiros</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{councillors?.length || 0}</p>
          <p className="text-sm text-muted-foreground">
            {activeCouncillors.length} ativos
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="font-medium">Titulares</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{titularCount}</p>
          <p className="text-sm text-muted-foreground">Membros titulares ativos</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Suplentes</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{suplenteCount}</p>
          <p className="text-sm text-muted-foreground">Membros suplentes ativos</p>
        </div>
      </div>

      <MandateAlerts />

      {councillors && (
        <CouncillorList
          councillors={councillors}
          onEdit={handleEdit}
          onDelete={(id) => setCouncillorToDelete(id)}
          onView={handleView}
        />
      )}

      <AlertDialog open={!!councillorToDelete} onOpenChange={() => setCouncillorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este conselheiro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}