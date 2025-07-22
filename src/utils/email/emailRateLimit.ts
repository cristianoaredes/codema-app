/**
 * Utilitário para gerenciar rate limiting de emails do Supabase
 */

const RATE_LIMIT_KEY = 'supabase_email_attempts';
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora em ms
const MAX_EMAILS_PER_HOUR = 3;

interface EmailAttempt {
  timestamp: number;
  type: 'magic_link' | 'password_reset';
  email: string;
}

/**
 * Registra uma tentativa de envio de email
 */
export function recordEmailAttempt(type: 'magic_link' | 'password_reset', email: string): void {
  try {
    const attempts = getEmailAttempts();
    const newAttempt: EmailAttempt = {
      timestamp: Date.now(),
      type,
      email
    };
    
    attempts.push(newAttempt);
    
    // Limpar tentativas antigas (mais de 1 hora)
    const validAttempts = attempts.filter(
      attempt => Date.now() - attempt.timestamp < RATE_LIMIT_WINDOW
    );
    
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(validAttempts));
    
    console.log(`📧 Email attempt recorded: ${type} for ${email}`);
    console.log(`📊 Total attempts in last hour: ${validAttempts.length}/${MAX_EMAILS_PER_HOUR}`);
  } catch (error) {
    console.error('Erro ao registrar tentativa de email:', error);
  }
}

/**
 * Obtém todas as tentativas de email válidas (última hora)
 */
export function getEmailAttempts(): EmailAttempt[] {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return [];
    
    const attempts: EmailAttempt[] = JSON.parse(stored);
    
    // Filtrar apenas tentativas da última hora
    return attempts.filter(
      attempt => Date.now() - attempt.timestamp < RATE_LIMIT_WINDOW
    );
  } catch (error) {
    console.error('Erro ao obter tentativas de email:', error);
    return [];
  }
}

/**
 * Verifica se é seguro enviar um email (não excedeu rate limit)
 */
export function canSendEmail(): { 
  canSend: boolean; 
  attemptsUsed: number; 
  maxAttempts: number;
  nextAvailableIn?: number;
} {
  const attempts = getEmailAttempts();
  const attemptsUsed = attempts.length;
  
  if (attemptsUsed < MAX_EMAILS_PER_HOUR) {
    return {
      canSend: true,
      attemptsUsed,
      maxAttempts: MAX_EMAILS_PER_HOUR
    };
  }
  
  // Calcular quando o próximo slot estará disponível
  const oldestAttempt = Math.min(...attempts.map(a => a.timestamp));
  const nextAvailableIn = RATE_LIMIT_WINDOW - (Date.now() - oldestAttempt);
  
  return {
    canSend: false,
    attemptsUsed,
    maxAttempts: MAX_EMAILS_PER_HOUR,
    nextAvailableIn: Math.max(0, nextAvailableIn)
  };
}

/**
 * Formata tempo restante em texto legível
 */
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.ceil(ms / (60 * 1000));
  
  if (minutes < 60) {
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours}h${remainingMinutes}min`;
}

/**
 * Mostra status atual do rate limiting
 */
export function showRateLimitStatus(): void {
  const status = canSendEmail();
  const attempts = getEmailAttempts();
  
  console.log('📧 EMAIL RATE LIMIT STATUS');
  console.log('━'.repeat(40));
  console.log(`📊 Tentativas usadas: ${status.attemptsUsed}/${status.maxAttempts}`);
  console.log(`✅ Pode enviar: ${status.canSend ? 'Sim' : 'Não'}`);
  
  if (!status.canSend && status.nextAvailableIn) {
    console.log(`⏰ Próximo disponível em: ${formatTimeRemaining(status.nextAvailableIn)}`);
  }
  
  if (attempts.length > 0) {
    console.log('\n📝 Tentativas recentes:');
    attempts.forEach((attempt, index) => {
      const timeAgo = Date.now() - attempt.timestamp;
      const minutesAgo = Math.floor(timeAgo / (60 * 1000));
      console.log(`  ${index + 1}. ${attempt.type} (${attempt.email}) - ${minutesAgo}min atrás`);
    });
  }
  
  console.log('━'.repeat(40));
}

/**
 * Limpa histórico de tentativas (para debug)
 */
export function clearEmailAttempts(): void {
  localStorage.removeItem(RATE_LIMIT_KEY);
  console.log('🗑️ Histórico de tentativas de email limpo');
}

// Disponibilizar no console global
if (typeof window !== 'undefined') {
  (window as any).showRateLimitStatus = showRateLimitStatus;
  (window as any).clearEmailAttempts = clearEmailAttempts;
  (window as any).canSendEmail = canSendEmail;
}