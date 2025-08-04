import { useState } from "react";
// ...imports unchanged

interface Review {
  id: string;
  secao: string;
  comentario: string;
  sugestao_alteracao: string;
  linha_referencia: number;
  status: string;
  resposta: string;
  created_at: string;
  revisor_id: string;
  respondido_por: string;
  respondido_em: string;
  profiles: {
    full_name: string;
    role: string;
  };
  resposta_profiles?: {
    full_name: string;
  };
}

export function AtaReviewSystem({ ataId, canReview }: AtaReviewSystemProps) {
  // ...unchanged

  // Buscar revisões da ata
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['ata-reviews', ataId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atas_revisoes')
        .select(`
          *,
          profiles:revisor_id(full_name, role),
          resposta_profiles:respondido_por(full_name)
        `)
        .eq('ata_id', ataId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type guard for profiles
      return (data || []).map((r: any) => ({
        ...r,
        profiles: r.profiles && typeof r.profiles === 'object' && r.profiles.full_name ? r.profiles : { full_name: '', role: '' },
        resposta_profiles: r.resposta_profiles && typeof r.resposta_profiles === 'object' && r.resposta_profiles.full_name ? r.resposta_profiles : undefined,
      })) as Review[];
    },
  });

  // ...rest of file unchanged
}