-- Views for 7/14/30 day summaries and current targets
create or replace view public.v_child_current_targets as
with last_target as (
  select t.child_id, t.low_mgdl, t.high_mgdl, t.severe_low_mgdl, t.severe_high_mgdl, t.critical_low_mgdl, t.critical_high_mgdl, t.effective_from, t.effective_to,
         row_number() over (partition by t.child_id order by t.effective_from desc) as rn
  from public.targets t
  where coalesce(t.active, true) = true
)
select lt.child_id, lt.low_mgdl, lt.high_mgdl, lt.severe_low_mgdl, lt.severe_high_mgdl, lt.critical_low_mgdl, lt.critical_high_mgdl, lt.effective_from, lt.effective_to
from last_target lt where lt.rn=1;

create or replace view public.v_child_summary_rolling as
with periods as (select unnest(array[7,14,30])::int as period_days),
base as (select c.id as child_id, p.period_days from public.children c cross join periods p),
targets as (select * from public.v_child_current_targets),
meas as (
  select b.child_id, b.period_days, m.glucose_mgdl, m.observed_at
  from base b join public.measurements m on m.child_id=b.child_id and m.observed_at >= now() - (b.period_days || ' days')::interval
),
stats as (
  select me.child_id, me.period_days, count(*) as total_readings,
         count(distinct ((me.observed_at at time zone 'UTC')::date)) as days_with_data,
         avg(me.glucose_mgdl)::numeric(10,1) as glucose_avg,
         min(me.glucose_mgdl) as glucose_min, max(me.glucose_mgdl) as glucose_max
  from meas me group by me.child_id, me.period_days
),
flags as (
  select me.child_id, me.period_days,
         sum(case when me.glucose_mgdl between coalesce(t.low_mgdl,70) and coalesce(t.high_mgdl,180) then 1 else 0 end) as in_range,
         sum(case when me.glucose_mgdl < coalesce(t.low_mgdl,70) then 1 else 0 end) as below_range,
         sum(case when me.glucose_mgdl > coalesce(t.high_mgdl,180) then 1 else 0 end) as above_range
  from meas me left join targets t on t.child_id=me.child_id group by me.child_id, me.period_days
),
meals as (
  select b.child_id, b.period_days, count(*) as meals_count
  from base b join public.meals ml on ml.child_id=b.child_id and ml.datetime >= now() - (b.period_days || ' days')::interval
  group by b.child_id, b.period_days
),
points as (
  select b.child_id, b.period_days, coalesce(sum(l.points),0) as points_sum
  from base b left join public.rewards_points_ledger l on l.child_id=b.child_id
   and l.occurred_on >= (current_date - (b.period_days - 1)) and l.occurred_on <= current_date
  group by b.child_id, b.period_days
)
select b.child_id, b.period_days, coalesce(s.total_readings,0) as total_readings, coalesce(s.days_with_data,0) as days_with_data,
       s.glucose_avg, s.glucose_min, s.glucose_max,
       case when coalesce(s.total_readings,0) > 0 then round(100.0 * f.in_range / s.total_readings, 1) end as tir_pct,
       case when coalesce(s.total_readings,0) > 0 then round(100.0 * f.below_range / s.total_readings, 1) end as below_pct,
       case when coalesce(s.total_readings,0) > 0 then round(100.0 * f.above_range / s.total_readings, 1) end as above_pct,
       coalesce(m.meals_count,0) as meals_count, p.points_sum
from base b left join stats s on (s.child_id,s.period_days)=(b.child_id,b.period_days)
left join flags f on (f.child_id,f.period_days)=(b.child_id,b.period_days)
left join meals m on (m.child_id,m.period_days)=(b.child_id,b.period_days)
left join points p on (p.child_id,p.period_days)=(b.child_id,b.period_days);

create or replace view public.v_child_summary_7d  as select * from public.v_child_summary_rolling where period_days=7;
create or replace view public.v_child_summary_14d as select * from public.v_child_summary_rolling where period_days=14;
create or replace view public.v_child_summary_30d as select * from public.v_child_summary_rolling where period_days=30;

create index if not exists idx_measurements_child_time on public.measurements(child_id, observed_at desc);
create index if not exists idx_meals_child_time on public.meals(child_id, datetime desc);
