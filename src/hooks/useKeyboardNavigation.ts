import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
  requireAuth?: boolean;
  requireCODEMA?: boolean;
  requireAdmin?: boolean;
}

export function useKeyboardNavigation() {
  const navigate = useNavigate();
  const { profile, hasAdminAccess, hasCODEMAAccess } = useAuth();

  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      // Navigation shortcuts
      {
        key: 'h',
        altKey: true,
        action: () => navigate('/dashboard'),
        description: 'Ir para Dashboard (Alt+H)',
        requireAuth: true,
      },
      {
        key: 'r',
        altKey: true,
        action: () => navigate('/relatorios'),
        description: 'Ir para Relatórios (Alt+R)',
      },
      {
        key: 'n',
        altKey: true,
        action: () => navigate('/criar-relatorio'),
        description: 'Novo Relatório (Alt+N)',
        requireAuth: true,
      },
      {
        key: 'm',
        altKey: true,
        action: () => navigate('/reunioes'),
        description: 'Ir para Reuniões (Alt+M)',
        requireCODEMA: true,
      },
      {
        key: 'c',
        altKey: true,
        action: () => navigate('/codema/conselheiros'),
        description: 'Ir para Conselheiros (Alt+C)',
        requireCODEMA: true,
      },
      {
        key: 'a',
        altKey: true,
        action: () => navigate('/codema/atas'),
        description: 'Ir para Atas (Alt+A)',
        requireCODEMA: true,
      },
      {
        key: 'd',
        altKey: true,
        action: () => navigate('/documentos'),
        description: 'Ir para Documentos (Alt+D)',
        requireCODEMA: true,
      },
      {
        key: 'p',
        altKey: true,
        action: () => navigate('/perfil'),
        description: 'Ir para Perfil (Alt+P)',
        requireAuth: true,
      },
      {
        key: 'u',
        altKey: true,
        action: () => navigate('/admin/users'),
        description: 'Gerenciar Usuários (Alt+U)',
        requireAdmin: true,
      },
      // Browser navigation
      {
        key: 'ArrowLeft',
        altKey: true,
        action: () => window.history.back(),
        description: 'Voltar (Alt+←)',
      },
      {
        key: 'ArrowRight',
        altKey: true,
        action: () => window.history.forward(),
        description: 'Avançar (Alt+→)',
      },
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.isContentEditable
      ) {
        return;
      }

      const shortcut = shortcuts.find(s => 
        s.key === event.key &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.altKey === event.altKey &&
        !!s.shiftKey === event.shiftKey
      );

      if (shortcut) {
        // Check permissions
        if (shortcut.requireAuth && !profile) return;
        if (shortcut.requireCODEMA && !hasCODEMAAccess) return;
        if (shortcut.requireAdmin && !hasAdminAccess) return;

        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, profile, hasAdminAccess, hasCODEMAAccess]);

  // Return available shortcuts for help/documentation
  const getAvailableShortcuts = () => {
    return [
      { key: 'Alt+H', description: 'Ir para Dashboard', available: !!profile },
      { key: 'Alt+R', description: 'Ir para Relatórios', available: true },
      { key: 'Alt+N', description: 'Novo Relatório', available: !!profile },
      { key: 'Alt+M', description: 'Ir para Reuniões', available: hasCODEMAAccess },
      { key: 'Alt+C', description: 'Ir para Conselheiros', available: hasCODEMAAccess },
      { key: 'Alt+A', description: 'Ir para Atas', available: hasCODEMAAccess },
      { key: 'Alt+D', description: 'Ir para Documentos', available: hasCODEMAAccess },
      { key: 'Alt+P', description: 'Ir para Perfil', available: !!profile },
      { key: 'Alt+U', description: 'Gerenciar Usuários', available: hasAdminAccess },
      { key: 'Alt+←', description: 'Voltar', available: true },
      { key: 'Alt+→', description: 'Avançar', available: true },
    ].filter(shortcut => shortcut.available);
  };

  return {
    getAvailableShortcuts,
  };
}