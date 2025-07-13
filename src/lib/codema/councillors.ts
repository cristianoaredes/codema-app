import { supabase } from '@/integrations/supabase/client';
import { Councillor } from '@/types/codema';

export const councillorsApi = {
  async list() {
    const { data, error } = await supabase
      .from('conselheiros')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    return data as Councillor[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('conselheiros')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Councillor;
  },

  async create(councillor: Omit<Councillor, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('conselheiros')
      .insert(councillor)
      .select()
      .single();
    
    if (error) throw error;
    return data as Councillor;
  },

  async update(id: string, councillor: Partial<Councillor>) {
    const { data, error } = await supabase
      .from('conselheiros')
      .update(councillor)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Councillor;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('conselheiros')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getActiveCouncillors() {
    const { data, error } = await supabase
      .from('conselheiros')
      .select('*')
      .eq('ativo', true)
      .order('tipo', { ascending: true })
      .order('nome');
    
    if (error) throw error;
    return data as Councillor[];
  },

  async getExpiringMandates(daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    const { data, error } = await supabase
      .from('conselheiros')
      .select('*')
      .eq('ativo', true)
      .lte('mandato_fim', futureDate.toISOString())
      .gte('mandato_fim', new Date().toISOString())
      .order('mandato_fim');
    
    if (error) throw error;
    return data as Councillor[];
  },

  async updateAttendance(id: string, missed: boolean) {
    const councillor = await this.getById(id);
    const faltas = missed 
      ? councillor.faltas_consecutivas + 1 
      : 0;
    
    return this.update(id, { faltas_consecutivas: faltas });
  }
};