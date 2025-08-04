import { useForm } from 'react-hook-form';
// ...imports unchanged

export function ImpedimentoForm({ 
  conselheiro_id, 
  reuniao_id, 
  processo_id, 
  onSuccess 
}: ImpedimentoFormProps) {
  const createImpedimento = useCreateImpedimento();

  const form = useForm<ImpedimentoFormData>({
    resolver: zodResolver(impedimentoSchema),
    defaultValues: {
      conselheiro_id: conselheiro_id || '',
      reuniao_id: reuniao_id || '',
      processo_id: processo_id || '',
      tipo_impedimento: 'interesse_pessoal',
      motivo: '',
    },
  });

  const onSubmit = async (data: ImpedimentoFormData) => {
    try {
      // Ensure conselheiro_id is present
      if (!data.conselheiro_id) return;
      await createImpedimento.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao declarar impedimento:', error);
    }
  };

  // ...rest of file unchanged
}