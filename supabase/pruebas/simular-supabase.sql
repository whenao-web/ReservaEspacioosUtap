-- SOLO PARA PRUEBAS FUERA DE SUPABASE. NUNCA se ejecuta en el proyecto de Supabase.
-- Simula lo minimo que Supabase ya trae: los roles anon y authenticated, el
-- esquema auth con su tabla users, y la funcion auth.uid().
-- Los roles son de todo el servidor: se crean solo si no existen
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema auth;
create schema extensions;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
$$;
grant usage on schema auth, public, extensions to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant references on auth.users to postgres;
