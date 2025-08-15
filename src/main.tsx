import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Expor funções utilitárias globalmente para debug via console
import { updateUserToAdmin, checkUser, listAllAdmins } from './utils/user/updateUserRole'
import { forceUserRefresh, checkUserDataConsistency, quickUserStatus } from './utils/auth'
import { showRateLimitStatus, clearEmailAttempts, canSendEmail } from './utils/email'

// Adicionar ao window para uso no console
declare global {
  interface Window {
    updateUserToAdmin: typeof updateUserToAdmin;
    checkUser: typeof checkUser;
    listAllAdmins: typeof listAllAdmins;
    forceUserRefresh: typeof forceUserRefresh;
    checkUserDataConsistency: typeof checkUserDataConsistency;
    quickUserStatus: typeof quickUserStatus;
    showRateLimitStatus: typeof showRateLimitStatus;
    clearEmailAttempts: typeof clearEmailAttempts;
    canSendEmail: typeof canSendEmail;
  }
}

// Disponibilizar funções globalmente apenas em desenvolvimento
if (import.meta.env.DEV) {
  window.updateUserToAdmin = updateUserToAdmin;
  window.checkUser = checkUser;
  window.listAllAdmins = listAllAdmins;
  window.forceUserRefresh = forceUserRefresh;
  window.checkUserDataConsistency = checkUserDataConsistency;
  window.quickUserStatus = quickUserStatus;
  window.showRateLimitStatus = showRateLimitStatus;
  window.clearEmailAttempts = clearEmailAttempts;
  window.canSendEmail = canSendEmail;

  // Only show debug messages in development
  if (import.meta.env.DEV) {
    console.log('🔧 Funções de debug disponíveis no console:');
    console.log('━'.repeat(50));
    console.log('👤 GERENCIAMENTO DE USUÁRIOS:');
    console.log('  - updateUserToAdmin(email, fullName) - Promove usuário a admin');
    console.log('  - checkUser(email) - Verifica dados do usuário');
    console.log('  - listAllAdmins() - Lista todos os administradores');
    console.log('  - quickUserStatus() - Status rápido do usuário atual');
    console.log('  - checkUserDataConsistency() - Verifica consistência dos dados');
    console.log('  - forceUserRefresh() - Força refresh da sessão');
    console.log('');
    console.log('📧 DEBUG DE EMAIL:');
    console.log('');
    console.log('📊 RATE LIMITING:');
    console.log('  - showRateLimitStatus() - 📊 Mostra status do rate limiting');
    console.log('  - canSendEmail() - ✅ Verifica se pode enviar email');
    console.log('  - clearEmailAttempts() - 🗑️ Limpa histórico (debug only)');
    console.log('━'.repeat(50));
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
