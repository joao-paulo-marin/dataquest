-- ==========================================================================
-- DATAQUEST: estrutura do banco no Supabase
-- Cole este arquivo inteiro no SQL Editor do seu projeto e clique em Run.
-- ==========================================================================

-- Uma linha por "fatia" de dados de cada usuário (configurações, habilidades,
-- biblioteca, projetos, flashcards, tarefas e sessões por ano).
create table if not exists public.dataquest_slices (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  slice      text        not null check (char_length(slice) between 1 and 40),
  u          bigint      not null,                         -- momento da última alteração (ms)
  d          text        not null check (octet_length(d) <= 2000000), -- conteúdo em JSON
  updated_at timestamptz not null default now(),
  primary key (user_id, slice)
);

-- Row Level Security: cada usuário só enxerga e altera as próprias linhas.
alter table public.dataquest_slices enable row level security;

drop policy if exists "dataquest: ler os próprios dados" on public.dataquest_slices;
drop policy if exists "dataquest: criar os próprios dados" on public.dataquest_slices;
drop policy if exists "dataquest: atualizar os próprios dados" on public.dataquest_slices;
drop policy if exists "dataquest: apagar os próprios dados" on public.dataquest_slices;

create policy "dataquest: ler os próprios dados" on public.dataquest_slices
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "dataquest: criar os próprios dados" on public.dataquest_slices
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "dataquest: atualizar os próprios dados" on public.dataquest_slices
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "dataquest: apagar os próprios dados" on public.dataquest_slices
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Desde 2026 o Supabase não expõe tabelas novas à API automaticamente.
-- Esta permissão libera a tabela só para usuários logados (nunca para anônimos);
-- o RLS acima continua decidindo quais linhas cada um vê.
grant select, insert, update, delete on table public.dataquest_slices to authenticated;
revoke all on table public.dataquest_slices from anon;
