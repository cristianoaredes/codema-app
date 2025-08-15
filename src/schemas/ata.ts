import * as z from 'zod';

export const ataSchema = z.object({
  numero: z.string().min(3).max(50),
  titulo: z.string().min(5).max(200),
  conteudo: z.string().min(10).max(50000),
  data_reuniao: z.date({ required_error: 'Data da reunião é obrigatória' }),
  status: z.enum(['rascunho', 'em_revisao', 'aprovada', 'publicada'], { required_error: 'Status é obrigatório' }),
  reuniao_id: z.string().optional(),
});

export type AtaFormData = z.infer<typeof ataSchema>;


