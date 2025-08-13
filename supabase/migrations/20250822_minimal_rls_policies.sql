-- Minimal RLS policies for essential tables
-- Safe-create helpers for policies

-- PROFILES
alter table if exists public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'profiles' and p.policyname = 'profiles_select_own'
  ) then
    execute $$create policy profiles_select_own on public.profiles
      for select using (id = auth.uid())$$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'profiles' and p.policyname = 'profiles_update_own'
  ) then
    execute $$create policy profiles_update_own on public.profiles
      for update using (id = auth.uid()) with check (id = auth.uid())$$;
  end if;
end $$;

-- CONSELHEIROS
alter table if exists public.conselheiros enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'conselheiros' and p.policyname = 'conselheiros_read'
  ) then
    execute $$create policy conselheiros_read on public.conselheiros
      for select using (public.has_codema_access())$$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'conselheiros' and p.policyname = 'conselheiros_write_admin_or_exec'
  ) then
    execute $$create policy conselheiros_write_admin_or_exec on public.conselheiros
      for all using (
        public.has_admin_access(auth.uid())
        or public.has_role(array['admin','secretario','presidente'])
      ) with check (
        public.has_admin_access(auth.uid())
        or public.has_role(array['admin','secretario','presidente'])
      )$$;
  end if;
end $$;

-- REUNIOES
alter table if exists public.reunioes enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'reunioes' and p.policyname = 'reunioes_read'
  ) then
    execute $$create policy reunioes_read on public.reunioes
      for select using (public.has_codema_access())$$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'reunioes' and p.policyname = 'reunioes_write_admin_or_secretario'
  ) then
    execute $$create policy reunioes_write_admin_or_secretario on public.reunioes
      for all using (
        public.has_admin_access(auth.uid())
        or public.has_role(array['admin','secretario'])
      ) with check (
        public.has_admin_access(auth.uid())
        or public.has_role(array['admin','secretario'])
      )$$;
  end if;
end $$;

-- ATAS
alter table if exists public.atas enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'atas' and p.policyname = 'atas_read'
  ) then
    execute $$create policy atas_read on public.atas
      for select using (public.has_codema_access())$$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'atas' and p.policyname = 'atas_write_admin_secretario_presidente'
  ) then
    execute $$create policy atas_write_admin_secretario_presidente on public.atas
      for all using (
        public.has_admin_access(auth.uid())
        or public.has_role(array['admin','secretario','presidente'])
      ) with check (
        public.has_admin_access(auth.uid())
        or public.has_role(array['admin','secretario','presidente'])
      )$$;
  end if;
end $$;

-- RESOLUCOES
alter table if exists public.resolucoes enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'resolucoes' and p.policyname = 'resolucoes_read'
  ) then
    execute $$create policy resolucoes_read on public.resolucoes
      for select using (public.has_codema_access())$$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'resolucoes' and p.policyname = 'resolucoes_write_admin_secretario_presidente'
  ) then
    execute $$create policy resolucoes_write_admin_secretario_presidente on public.resolucoes
      for all using (
        public.has_admin_access(auth.uid())
        or public.has_role(array['admin','secretario','presidente'])
      ) with check (
        public.has_admin_access(auth.uid())
        or public.has_role(array['admin','secretario','presidente'])
      )$$;
  end if;
end $$;

-- AUDIT LOGS
alter table if exists public.audit_logs enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'audit_logs' and p.policyname = 'audit_logs_read_admin_only'
  ) then
    execute $$create policy audit_logs_read_admin_only on public.audit_logs
      for select using (public.has_admin_access(auth.uid()))$$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = 'audit_logs' and p.policyname = 'audit_logs_insert_authenticated'
  ) then
    execute $$create policy audit_logs_insert_authenticated on public.audit_logs
      for insert with check (auth.uid() is not null)$$;
  end if;
end $$;
