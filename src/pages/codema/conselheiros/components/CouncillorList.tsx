import { useState } from "react";
import { Councillor } from "@/types/codema";
import { CouncillorCard } from "./CouncillorCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface CouncillorListProps {
  councillors: Councillor[];
  onEdit: (councillor: Councillor) => void;
  onDelete: (id: string) => void;
  onView: (councillor: Councillor) => void;
}

export function CouncillorList({ councillors, onEdit, onDelete, onView }: CouncillorListProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSegment, setFilterSegment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredCouncillors = councillors.filter((councillor) => {
    const matchesSearch = councillor.nome.toLowerCase().includes(search.toLowerCase()) ||
      councillor.entidade_representada.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "all" || councillor.tipo === filterType;
    const matchesSegment = filterSegment === "all" || councillor.segmento === filterSegment;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && councillor.ativo) ||
      (filterStatus === "inactive" && !councillor.ativo);

    return matchesSearch && matchesType && matchesSegment && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar conselheiro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="titular">Titular</SelectItem>
            <SelectItem value="suplente">Suplente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSegment} onValueChange={setFilterSegment}>
          <SelectTrigger>
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os segmentos</SelectItem>
            <SelectItem value="poder_publico">Poder Público</SelectItem>
            <SelectItem value="sociedade_civil">Sociedade Civil</SelectItem>
            <SelectItem value="setor_produtivo">Setor Produtivo</SelectItem>
            <SelectItem value="instituicao_ensino">Instituição de Ensino</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCouncillors.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum conselheiro encontrado com os filtros aplicados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCouncillors.map((councillor) => (
            <CouncillorCard
              key={councillor.id}
              councillor={councillor}
              onEdit={() => onEdit(councillor)}
              onDelete={() => onDelete(councillor.id)}
              onView={() => onView(councillor)}
            />
          ))}
        </div>
      )}
    </div>
  );
}