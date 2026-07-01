-- ============================================================
--  Horizonte Imóveis — configuração do banco (Supabase)
--  Cole tudo isto no Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tabela de imóveis -----------------------------------------
create table if not exists public.properties (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  titulo      text not null,
  tipo        text not null default 'apartamento',   -- apartamento | casa | terreno | comercial
  finalidade  text not null default 'venda',         -- venda | aluguel
  preco       numeric not null default 0,
  cidade      text,
  bairro      text,
  quartos     int default 0,
  banheiros   int default 0,
  vagas       int default 0,
  area        numeric,
  descricao   text,
  fotos       text[] default '{}',
  destaque    boolean default false
);

-- 2) Row Level Security ----------------------------------------
alter table public.properties enable row level security;

-- leitura liberada para todos (site público)
drop policy if exists "properties_public_read" on public.properties;
create policy "properties_public_read" on public.properties
  for select using (true);

-- escrita apenas para usuários autenticados (painel admin)
drop policy if exists "properties_auth_insert" on public.properties;
create policy "properties_auth_insert" on public.properties
  for insert to authenticated with check (true);

drop policy if exists "properties_auth_update" on public.properties;
create policy "properties_auth_update" on public.properties
  for update to authenticated using (true) with check (true);

drop policy if exists "properties_auth_delete" on public.properties;
create policy "properties_auth_delete" on public.properties
  for delete to authenticated using (true);

-- 3) Storage: bucket público de fotos --------------------------
insert into storage.buckets (id, name, public)
values ('imoveis', 'imoveis', true)
on conflict (id) do nothing;

drop policy if exists "imoveis_public_read" on storage.objects;
create policy "imoveis_public_read" on storage.objects
  for select using (bucket_id = 'imoveis');

drop policy if exists "imoveis_auth_insert" on storage.objects;
create policy "imoveis_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'imoveis');

drop policy if exists "imoveis_auth_update" on storage.objects;
create policy "imoveis_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'imoveis');

drop policy if exists "imoveis_auth_delete" on storage.objects;
create policy "imoveis_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'imoveis');

-- 4) Dados de exemplo (opcional) -------------------------------
insert into public.properties (titulo, tipo, finalidade, preco, cidade, bairro, quartos, banheiros, vagas, area, destaque, descricao, fotos) values
('Apartamento moderno com varanda gourmet', 'apartamento', 'venda', 690000, 'São Paulo', 'Pinheiros', 3, 2, 2, 92, true,
 'Apartamento reformado, andar alto, sol da manhã, varanda gourmet integrada à sala. Condomínio com lazer completo.',
 array['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80']),
('Casa térrea com quintal amplo', 'casa', 'venda', 850000, 'Campinas', 'Barão Geraldo', 3, 3, 4, 180, true,
 'Casa térrea em rua tranquila, quintal com espaço para piscina, edícula e churrasqueira. Ótima localização.',
 array['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1000&q=80','https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80']),
('Studio compacto perto do metrô', 'apartamento', 'aluguel', 2200, 'São Paulo', 'República', 1, 1, 0, 32, false,
 'Studio mobiliado, ideal para quem trabalha no centro. A dois minutos da estação de metrô.',
 array['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80']),
('Cobertura duplex com vista', 'apartamento', 'venda', 1450000, 'Santos', 'Gonzaga', 4, 4, 3, 210, true,
 'Cobertura duplex com vista para o mar, terraço com piscina privativa e churrasqueira. Acabamento de alto padrão.',
 array['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80']),
('Sala comercial em edifício corporativo', 'comercial', 'aluguel', 4800, 'São Paulo', 'Itaim Bibi', 0, 2, 4, 120, false,
 'Sala comercial ampla, piso elevado, ar-condicionado central. Prédio com recepção e segurança 24h.',
 array['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80']),
('Terreno plano em condomínio fechado', 'terreno', 'venda', 320000, 'Atibaia', 'Jardim dos Pinheiros', 0, 0, 0, 450, false,
 'Terreno plano e pronto para construir, em condomínio fechado com portaria e área verde.',
 array['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80']);

-- ============================================================
--  Pronto! Agora crie o usuário do corretor em:
--  Authentication → Users → Add user (e-mail + senha, "Auto Confirm")
-- ============================================================
