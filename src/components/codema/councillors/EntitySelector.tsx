import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEGMENTS = {
  poder_publico: 'Poder Público',
  sociedade_civil: 'Sociedade Civil',
  setor_produtivo: 'Setor Produtivo',
  instituicao_ensino: 'Instituição de Ensino'
};

interface EntitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EntitySelector({ value, onChange, disabled }: EntitySelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o segmento" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SEGMENTS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}