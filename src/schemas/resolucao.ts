import { z } from 'zod';

export const resolucaoSchema = z.object({
  template_id: z.string().optional(),
  reuniao_id: z.string().optional(),
  titulo: z.string().min(10),
  ementa: z.string().min(20),
  tipo: z.enum(['normativa', 'deliberativa', 'administrativa'], { required_error: 'Selecione o tipo de resolução' }),
  base_legal: z.string().min(10),
  disposicoes_finais: z.string().optional(),
});

export type ResolucaoFormData = z.infer<typeof resolucaoSchema>;


