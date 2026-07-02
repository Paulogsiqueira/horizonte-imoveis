-- ============================================================
--  Horizonte Imóveis — blindar 5 imóveis (modo demonstração)
--  Rode no Supabase → SQL Editor → New query → Run
--  (Depois de já ter rodado o SETUP.sql)
-- ============================================================

-- 1) coluna que marca um imóvel como fixo/protegido ------------
alter table public.properties
  add column if not exists protegido boolean not null default false;

-- 2) marca os 5 imóveis mais antigos como protegidos -----------
update public.properties
  set protegido = true
  where id in (
    select id from public.properties order by created_at asc limit 5
  );

-- 3) RLS: usuário autenticado só edita/exclui imóveis NÃO protegidos
drop policy if exists "properties_auth_update" on public.properties;
create policy "properties_auth_update" on public.properties
  for update to authenticated
  using (protegido = false) with check (protegido = false);

drop policy if exists "properties_auth_delete" on public.properties;
create policy "properties_auth_delete" on public.properties
  for delete to authenticated
  using (protegido = false);

-- 4) impede criar novos imóveis já marcados como protegidos ----
drop policy if exists "properties_auth_insert" on public.properties;
create policy "properties_auth_insert" on public.properties
  for insert to authenticated
  with check (protegido = false);

-- ============================================================
--  Pronto! Os 5 imóveis mais antigos ficam fixos: qualquer
--  visitante pode adicionar/editar/excluir os DEMAIS, mas não
--  consegue mexer nesses 5 — nem pela API.
-- ============================================================
