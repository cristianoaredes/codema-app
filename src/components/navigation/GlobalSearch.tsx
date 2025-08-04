import React, { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, Gavel, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type SearchResult = {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<any>;
  metadata: Record<string, any>;
};

interface GlobalSearchProps {
  variant?: string;
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({ 
  variant = 'inline', 
  placeholder = "Pesquisar...",
  className 
}: GlobalSearchProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasCODEMAAccess } = useAuth();

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const results: SearchResult[] = [];

    try {
      // Search reports (public)
      const { data: reports } = await supabase
        .from('reports')
        .select('id, title, description, location, status, priority, category_id, created_at')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
        .limit(5);

      (reports || []).forEach((report: any) => {
        results.push({
          id: report.id,
          type: 'report',
          title: report.title,
          description: report.description || report.location,
          url: `/relatorios/${report.id}`,
          icon: FileText,
          metadata: {
            date: report.created_at,
            status: report.status,
            priority: report.priority
          }
        });
      });

      // Search CODEMA content if user has access
      if (hasCODEMAAccess) {
        // Search meetings
        const { data: meetings } = await supabase
          .from('reunioes')
          .select('id, titulo, descricao, data_reuniao, status')
          .or(`titulo.ilike.%${searchQuery}%,descricao.ilike.%${searchQuery}%`)
          .limit(3);

        (meetings || []).forEach((meeting: any) => {
          results.push({
            id: meeting.id,
            type: 'meeting',
            title: meeting.titulo,
            description: meeting.descricao,
            url: `/reunioes/${meeting.id}`,
            icon: Calendar,
            metadata: {
              date: meeting.data_reuniao,
              status: meeting.status
            }
          });
        });

        // Search minutes
        const { data: minutes } = await supabase
          .from('atas')
          .select('id, titulo, conteudo, data_reuniao, status')
          .or(`titulo.ilike.%${searchQuery}%,conteudo.ilike.%${searchQuery}%`)
          .limit(3);

        (minutes || []).forEach((minute: any) => {
          results.push({
            id: minute.id,
            type: 'minute',
            title: minute.titulo,
            description: `Ata da reunião de ${minute.data_reuniao ? new Date(minute.data_reuniao).toLocaleDateString('pt-BR') : ''}`,
            url: `/codema/atas/${minute.id}`,
            icon: FileText,
            metadata: {
              date: minute.data_reuniao,
              status: minute.status
            }
          });
        });

        // Search resolutions
        const { data: resolutions } = await supabase
          .from('resolucoes')
          .select('id, titulo, descricao, status, created_at')
          .or(`titulo.ilike.%${searchQuery}%,descricao.ilike.%${searchQuery}%`)
          .limit(3);

        (resolutions || []).forEach((resolution: any) => {
          results.push({
            id: resolution.id,
            type: 'resolution',
            title: resolution.titulo,
            description: resolution.descricao,
            url: `/codema/resolucoes/${resolution.id}`,
            icon: Gavel,
            metadata: {
              date: resolution.created_at,
              status: resolution.status
            }
          });
        });

        // Search counselors (now using profiles table)
        const { data: counselors } = await supabase
          .from('profiles')
          .select('id, full_name, role, email')
          .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
          .ilike('full_name', `%${searchQuery}%`)
          .limit(3);

        (counselors || []).forEach((counselor: any) => {
          results.push({
            id: counselor.id,
            type: 'counselor',
            title: counselor.full_name,
            description: `Conselheiro - ${counselor.email || ''}`,
            url: `/codema/conselheiros/${counselor.id}`,
            icon: Users,
            metadata: {
              status: 'ativo'
            }
          });
        });
      }

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }

    setResults(results);
  }, [hasCODEMAAccess]);

  // ...rest of file unchanged
  return null;
}