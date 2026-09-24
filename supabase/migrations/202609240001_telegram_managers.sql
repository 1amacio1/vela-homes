create table public.vela_telegram_managers (
  user_id text primary key check (user_id ~ '^[0-9]+$'),
  chat_id text not null check (chat_id = user_id),
  name text not null,
  username text,
  status text not null default 'guest' check (status in ('guest','pending','active','disabled','rejected')),
  requested_at timestamptz,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.vela_telegram_updates (
  id bigint primary key,
  status text not null default 'processing',
  locked_until timestamptz not null default now() + interval '60 seconds',
  created_at timestamptz not null default now()
);
create table public.vela_telegram_deliveries (
  lead_id uuid not null references public.vela_leads(id) on delete cascade,
  chat_id text not null,
  status text not null default 'pending',
  next_part integer not null default 0,
  message_id bigint,
  updated_at timestamptz not null default now(),
  primary key(lead_id,chat_id)
);
alter table public.vela_leads add column telegram_locked_until timestamptz;
alter table public.vela_telegram_managers enable row level security;
alter table public.vela_telegram_updates enable row level security;
alter table public.vela_telegram_deliveries enable row level security;
revoke all on public.vela_telegram_managers,public.vela_telegram_updates,public.vela_telegram_deliveries from anon,authenticated;
grant all on public.vela_telegram_managers,public.vela_telegram_updates,public.vela_telegram_deliveries to service_role;

create function public.vela_claim_telegram_update(p_id bigint) returns text language plpgsql security invoker set search_path=public as $$
declare claimed bigint; current_status text;
begin
  insert into vela_telegram_updates(id) values(p_id)
  on conflict(id) do update set status='processing',locked_until=now()+interval '60 seconds'
  where vela_telegram_updates.status <> 'done' and vela_telegram_updates.locked_until < now()
  returning id into claimed;
  if claimed is not null then return 'claimed'; end if;
  select status into current_status from vela_telegram_updates where id=p_id;
  return current_status;
end; $$;

create function public.vela_claim_telegram_lead(p_id uuid) returns setof public.vela_leads language sql security invoker set search_path=public as $$
  update vela_leads set telegram_status='sending',telegram_locked_until=now()+interval '5 minutes'
  where id=p_id and (telegram_status in ('pending','failed','not_configured') or (telegram_status='sending' and coalesce(telegram_locked_until,'-infinity'::timestamptz)<now()))
  returning *;
$$;
revoke all on function public.vela_claim_telegram_update(bigint),public.vela_claim_telegram_lead(uuid) from public,anon,authenticated;
grant execute on function public.vela_claim_telegram_update(bigint),public.vela_claim_telegram_lead(uuid) to service_role;
