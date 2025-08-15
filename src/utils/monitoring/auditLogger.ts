import { supabase } from '@/integrations/supabase/client';

export async function logAction(
  action: string,
  entity: string,
  entityId: string,
  details?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await (supabase as any).from('audit_logs').insert({
      user_id: user?.id,
      action,
      entity,
      entity_id: entityId,
      details,
      ip_address: '127.0.0.1' // Simplificado por agora
    });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}

/**
 * Versão resiliente: nunca lança exceção para não quebrar fluxos críticos
 */
export async function logActionSafe(
  action: string,
  entity: string,
  entityId: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await logAction(action, entity, entityId, details);
  } catch {
    // swallow
  }
}