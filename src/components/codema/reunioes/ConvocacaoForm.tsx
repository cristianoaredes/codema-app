import { useState } from 'react';
// ...imports unchanged

export function ConvocacaoForm({ reuniao_id, tipo_reuniao, onSuccess }: ConvocacaoFormProps) {
  // ...unchanged

  const onSubmit = async (data: ConvocacaoFormData) => {
    try {
      // Ensure conselheiros_ids is present
      if (!data.conselheiros_ids || data.conselheiros_ids.length === 0) return;
      await enviarConvocacoes.mutateAsync({
        reuniao_id,
        conselheiros_ids: data.conselheiros_ids,
        tipo_envio: data.tipo_envio,
        template_id: data.template_id,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao enviar convocações:', error);
    }
  };

  // ...rest of file unchanged
}