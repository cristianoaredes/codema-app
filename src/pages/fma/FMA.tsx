import { useEffect, useState, useCallback } from "react";
import { useAuth, useToast } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
// ...imports unchanged

const FMA = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newReceita, setNewReceita] = useState<any>({});
  const [newProjeto, setNewProjeto] = useState<any>({});

  const createReceita = async () => {
    try {
      // Fix: cast tipo_receita to enum
      const tipo_receita_enum = newReceita.tipo_receita as "multa" | "tac" | "convenio" | "doacao" | "transferencia" | "outros";
      const { error } = await supabase
        .from("fma_receitas")
        .insert({
          ...newReceita,
          tipo_receita: tipo_receita_enum,
          valor: parseFloat(newReceita.valor),
          responsavel_cadastro_id: user?.id
        });

      if (error) throw error;
      // ...unchanged
    } catch (error) {
      // ...unchanged
    }
  };

  const createProjeto = async () => {
    try {
      // Fix: cast area_atuacao to enum
      const area_atuacao_enum = newProjeto.area_atuacao as "educacao_ambiental" | "recuperacao_areas" | "conservacao_biodiversidade" | "saneamento" | "fiscalizacao" | "outros";
      const { error } = await supabase
        .from("fma_projetos")
        .insert({
          ...newProjeto,
          area_atuacao: area_atuacao_enum,
          valor_solicitado: parseFloat(newProjeto.valor_solicitado),
          prazo_execucao: parseInt(newProjeto.prazo_execucao)
        });

      if (error) throw error;
      // ...unchanged
    } catch (error) {
      // ...unchanged
    }
  };

  // ...rest of file unchanged
};
export default FMA;