create or replace function public.vela_analytics(p_start timestamptz,p_end timestamptz) returns jsonb language sql stable security invoker set search_path=public as $$
with s as (select * from vela_sessions where created_at>=p_start and created_at<p_end),
l as (select * from vela_leads where created_at>=p_start and created_at<p_end),
e as (select * from vela_events where created_at>=p_start and created_at<p_end),
sources as (select source,count(*) visits,count(distinct visitor_id) visitors from s group by source),
days as (select generate_series((now() at time zone 'Europe/Moscow')::date-6,(now() at time zone 'Europe/Moscow')::date,'1 day')::date as day_date),
cohort as (select id,date_trunc('week',first_seen at time zone 'Europe/Moscow')::date week from vela_visitors where first_seen>=now()-interval '8 weeks'),
cohort_rows as (select week,count(*) size,(select count(distinct ll.visitor_id) from vela_leads ll join cohort cc on cc.id=ll.visitor_id where cc.week=c.week) leads,
(select jsonb_agg(jsonb_build_object('week',n,'visitors',(select count(distinct ss.visitor_id) from vela_sessions ss join cohort cc on cc.id=ss.visitor_id where cc.week=c.week and date_trunc('week',ss.created_at at time zone 'Europe/Moscow')::date=c.week+n*7))) from generate_series(0,4) n) retention from cohort c group by week)
select jsonb_build_object(
'metrics',jsonb_build_object('visits',(select count(*) from s),'visitors',(select count(distinct visitor_id) from s),'leads',(select count(*) from l),'converted_sessions',(select count(distinct s.id) from s join vela_leads ll on ll.session_id=s.id and ll.created_at<p_end),'phone',(select count(*) from e where name='phone_click'),'email',(select count(*) from e where name='email_click'),'cta',(select count(*) from e where name='cta_click'),'calculator',(select count(*) from e where name='calculator_change')),
'sources',coalesce((select jsonb_agg(jsonb_build_object('name',source,'visits',visits,'visitors',visitors,'leads',(select count(*) from l where l.source=sources.source))) from sources),'[]'),
'weekly',coalesce((select jsonb_agg(jsonb_build_object('day',day_date,'visits',(select count(*) from vela_sessions where (created_at at time zone 'Europe/Moscow')::date=day_date),'leads',(select count(*) from vela_leads where (created_at at time zone 'Europe/Moscow')::date=day_date)) order by day_date) from days),'[]'),
'cohorts',coalesce((select jsonb_agg(to_jsonb(cohort_rows) order by week desc) from cohort_rows),'[]'));
$$;
revoke all on function public.vela_analytics(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.vela_analytics(timestamptz,timestamptz) to service_role;
create or replace function public.vela_referral_stats() returns jsonb language sql stable security invoker set search_path=public as $$
select coalesce(jsonb_agg(jsonb_build_object('code',r.code,'name',r.name,'created_at',r.created_at,'visits',(select count(*) from vela_sessions s where s.ref_code=r.code),'visitors',(select count(distinct visitor_id) from vela_sessions s where s.ref_code=r.code),'leads',(select count(*) from vela_leads l where l.ref_code=r.code),'converted_sessions',(select count(distinct s.id) from vela_sessions s join vela_leads l on l.session_id=s.id where s.ref_code=r.code)) order by r.created_at desc),'[]') from vela_referrals r;
$$;
revoke all on function public.vela_referral_stats() from public,anon,authenticated;
grant execute on function public.vela_referral_stats() to service_role;
