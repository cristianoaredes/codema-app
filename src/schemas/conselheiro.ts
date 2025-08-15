import * as z from 'zod';

export const conselheiroSchema = z.object({
  nome_completo: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z.string()
    .optional()
    .refine((val) => !val || val === '' || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), 'CPF deve estar no formato XXX.XXX.XXX-XX')
    .refine((val) => {
      if (!val || val === '') return true;
      const cpf = val.replace(/[^\d]/g, '');
      if (cpf.length !== 11) return false;
      if(/^(\d)\1{10}$/.test(cpf)) return false;
      let sum = 0; let remainder;
      for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      remainder = (sum * 10) % 11; if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(9, 10))) return false;
      sum = 0; for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
      remainder = (sum * 10) % 11; if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(10, 11))) return false;
      return true;
    }, 'CPF inválido'),
  email: z.string()
    .optional()
    .refine((val) => !val || val === '' || z.string().email().safeParse(val).success, 'Email deve ser válido'),
  telefone: z.string()
    .optional()
    .refine((val) => !val || val === '' || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(val), 'Telefone deve estar no formato (XX) XXXXX-XXXX'),
  endereco: z.string().optional(),
  mandato_inicio: z.date({ required_error: 'Data de início do mandato é obrigatória' }),
  mandato_fim: z.date({ required_error: 'Data de fim do mandato é obrigatória' }),
  mandato_numero: z.number().int().positive().optional(),
  entidade_representada: z.string()
    .min(2, 'Entidade representada deve ter pelo menos 2 caracteres')
    .max(200, 'Entidade representada deve ter no máximo 200 caracteres'),
  segmento: z.enum(['governo', 'sociedade_civil', 'setor_produtivo'], { required_error: 'Segmento é obrigatório' }),
  titular: z.boolean(),
  observacoes: z.string().optional(),
}).refine((data) => data.mandato_fim > data.mandato_inicio, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['mandato_fim'],
}).refine((data) => {
  const diffTime = data.mandato_fim.getTime() - data.mandato_inicio.getTime();
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
  return diffYears <= 6;
}, {
  message: 'Mandato não pode ser superior a 6 anos',
  path: ['mandato_fim'],
}).refine((data) => {
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  return data.mandato_inicio <= oneYearFromNow;
}, {
  message: 'Data de início não pode ser superior a 1 ano no futuro',
  path: ['mandato_inicio'],
});

export type ConselheiroFormData = z.infer<typeof conselheiroSchema>;


