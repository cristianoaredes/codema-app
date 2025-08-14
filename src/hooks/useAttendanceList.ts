import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  generateAttendanceListPDF,
  downloadAttendanceListPDF,
  previewAttendanceListPDF 
} from '@/services/attendanceListService';

/**
 * Hook para gerar PDF da lista de presença
 */
export function useGenerateAttendanceList() {
  return useMutation({
    mutationFn: generateAttendanceListPDF,
    onSuccess: () => {
      toast.success('Lista de presença gerada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao gerar lista de presença:', error);
      toast.error(error.message || 'Erro ao gerar lista de presença');
    },
  });
}

/**
 * Hook para baixar PDF da lista de presença
 */
export function useDownloadAttendanceList() {
  return useMutation({
    mutationFn: downloadAttendanceListPDF,
    onSuccess: () => {
      toast.success('Lista de presença baixada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao baixar lista de presença:', error);
      toast.error(error.message || 'Erro ao baixar lista de presença');
    },
  });
}

/**
 * Hook para visualizar PDF da lista de presença
 */
export function usePreviewAttendanceList() {
  return useMutation({
    mutationFn: previewAttendanceListPDF,
    onSuccess: () => {
      toast.success('Lista de presença aberta em nova aba');
    },
    onError: (error: Error) => {
      console.error('Erro ao visualizar lista de presença:', error);
      toast.error(error.message || 'Erro ao visualizar lista de presença');
    },
  });
}