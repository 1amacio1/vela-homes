-- VELA data is isolated from any other application in this project.
create table if not exists public.vela_referrals (code text primary key, name text not null, created_at timestamptz not null default now());
create table if not exists public.vela_visitors (id uuid primary key, first_seen timestamptz not null default now());
create table if not exists public.vela_sessions (id uuid primary key, visitor_id uuid not null references public.vela_visitors(id), created_at timestamptz not null default now(), source text not null default 'Прямой переход', ref_code text references public.vela_referrals(code), utm jsonb not null default '{}', landing text not null default '/');
create table if not exists public.vela_events (id bigint generated always as identity primary key, created_at timestamptz not null default now(), session_id uuid not null references public.vela_sessions(id), visitor_id uuid not null, name text not null, detail text);
create index if not exists vela_events_date on public.vela_events(created_at);
create index if not exists vela_events_session on public.vela_events(session_id);
create index if not exists vela_sessions_date on public.vela_sessions(created_at);
create index if not exists vela_sessions_ref on public.vela_sessions(ref_code);
create table if not exists public.vela_leads (id uuid primary key, created_at timestamptz not null default now(), name text not null, phone text not null, email text not null, region text not null, services jsonb not null, area numeric, comment text not null default '', calculator jsonb, files jsonb not null default '[]', session_id uuid, visitor_id uuid, source text not null default 'Прямой переход', ref_code text references public.vela_referrals(code), utm jsonb not null default '{}', consent_at timestamptz not null default now(), consent_version text not null default '2026-09-23', telegram_status text not null default 'pending', telegram_error text, telegram_message_id bigint);
create index if not exists vela_leads_date on public.vela_leads(created_at);
create table if not exists public.vela_limits (key text primary key, count integer not null, expires_at timestamptz not null);
alter table public.vela_referrals enable row level security;
alter table public.vela_visitors enable row level security;
alter table public.vela_sessions enable row level security;
alter table public.vela_events enable row level security;
alter table public.vela_leads enable row level security;
alter table public.vela_limits enable row level security;
revoke all on public.vela_referrals,public.vela_visitors,public.vela_sessions,public.vela_events,public.vela_leads,public.vela_limits from anon,authenticated;
grant all on public.vela_referrals,public.vela_visitors,public.vela_sessions,public.vela_events,public.vela_leads,public.vela_limits to service_role;
grant usage,select on sequence public.vela_events_id_seq to service_role;
create or replace function public.vela_rate_limit(p_key text,p_limit integer,p_seconds integer) returns boolean language plpgsql security invoker set search_path = public as $$
declare hits integer;
begin
  insert into vela_limits(key,count,expires_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
  on conflict(key) do update set count=case when vela_limits.expires_at<now() then 1 else vela_limits.count+1 end, expires_at=case when vela_limits.expires_at<now() then now()+make_interval(secs=>p_seconds) else vela_limits.expires_at end returning count into hits;
  delete from vela_limits where expires_at<now()-interval '1 day';
  return hits<=p_limit;
end; $$;
revoke all on function public.vela_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.vela_rate_limit(text,integer,integer) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('vela-attachments','vela-attachments',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']) on conflict(id) do nothing;
