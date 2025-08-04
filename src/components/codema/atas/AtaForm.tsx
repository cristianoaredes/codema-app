import { useState, useEffect } from "react";
// ...imports unchanged

export function AtaForm({ ata, onClose }: AtaFormProps) {
  // ...unchanged

  // Buscar conselheiros para lista de presença (agora usando profiles)
  const { data: conselheiros = [] } = useQuery({
    queryKey: ['conselheiros-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_active')
      .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
      .eq('is_active', true)
      .order('full_name');

      if (error) throw error;
      // Map to expected format
      return (data || []).map((profile: any) => ({
        id: profile.id,
        nome: profile.full_name,
        cargo: profile.role === 'conselheiro_titular' ? 'Titular' : 'Suplente',
        tipo: profile.role,
        ativo: profile.is_active
      }));
    },
  });

  // ...rest of file unchanged
}