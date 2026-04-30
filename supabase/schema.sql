-- ============================================================
-- ESPAÇO INTEGRAR — Schema do banco de dados (Supabase)
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Tabela de perfis (complementa auth.users)
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  nome       text not null,
  crp        text,
  role       text not null default 'psicologo',
  created_at timestamptz not null default now()
);

-- Tabela de pacientes
create table if not exists public.pacientes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  nome       text not null,
  idade      integer,
  sexo       text,
  email      text,
  obs        text,
  created_at timestamptz not null default now()
);

-- Tabela de aplicações de instrumentos
create table if not exists public.aplicacoes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users on delete cascade not null,
  paciente_id     uuid references public.pacientes(id) on delete set null,
  instrumento     text not null default 'SRQ-20',
  score           integer not null,
  clinico         boolean not null,
  respostas       jsonb,
  nome_paciente   text not null,
  idade_paciente  integer,
  sexo_paciente   text,
  created_at      timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.pacientes enable row level security;
alter table public.aplicacoes enable row level security;

-- Profiles: cada usuário vê/edita só o próprio perfil
create policy "Perfil próprio - leitura"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Perfil próprio - atualização"
  on public.profiles for update
  using (auth.uid() = id);

-- Pacientes: cada psicólogo gerencia os seus
create policy "Pacientes do próprio usuário"
  on public.pacientes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Aplicações: cada psicólogo gerencia as suas
create policy "Aplicações do próprio usuário"
  on public.aplicacoes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Trigger: criar perfil automaticamente ao cadastrar ──────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, crp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'crp'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
