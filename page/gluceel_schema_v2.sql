-- =========================================================
-- GLUCEEL — FULL SCHEMA V1 (Reordered to avoid 42P01)
-- Target: Supabase Postgres
-- =========================================================
begin;

-- ---------- Extensions ----------
create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists "uuid-ossp";   -- uuid_generate_v4()

-- =========================================================
-- A) Create *core tables first* (no RLS yet) so helper funcs can reference them
--    profiles / children / child_guardians / share_access
-- =========================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'guardian' check (role in ('admin','guardian','doctor')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  sex text check (sex in ('male','female')),
  birthdate date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.child_guardians (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  relation text,
  is_primary boolean default false,
  can_edit boolean default true,
  active boolean default true,
  created_at timestamptz not null default now(),
  unique(child_id, user_id, active)
);

create table if not exists public.share_access (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  doctor_user_id uuid not null references public.profiles(user_id) on delete cascade,
  scopes text[] not null default '{read}',
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- B) Helper functions for RLS (now tables exist)
-- =========================================================
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists(
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_guardian_of(u uuid, child uuid) returns boolean
language sql stable as $$
  select exists(
    select 1 from public.child_guardians g
    where g.user_id = u and g.child_id = child and g.active = true
  );
$$;

create or replace function public.is_doctor_for(u uuid, child uuid) returns boolean
language sql stable as $$
  select exists(
    select 1 from public.share_access s
    where s.doctor_user_id = u and s.child_id = child
      and s.active = true and (s.expires_at is null or s.expires_at > now())
  );
$$;

create or replace function public.can_access_child(child uuid) returns boolean
language sql stable as $$
  select coalesce(
    public.is_admin()
    or public.is_guardian_of(auth.uid(), child)
    or public.is_doctor_for(auth.uid(), child)
  , false);
$$;

-- =========================================================
-- C) Enable RLS + policies on the *core* tables
-- =========================================================
alter table public.profiles enable row level security;
create policy prof_self_select on public.profiles
  for select using (auth.uid() = user_id or public.is_admin());
create policy prof_self_update on public.profiles
  for update using (auth.uid() = user_id or public.is_admin());
create policy prof_admin_insert on public.profiles
  for insert with check (public.is_admin());

alter table public.children enable row level security;
create policy child_select on public.children
  for select using (public.can_access_child(id) or public.is_admin());
create policy child_modify on public.children
  for all using (public.is_admin())
  with check (public.is_admin());

alter table public.child_guardians enable row level security;
create policy cg_select on public.child_guardians
  for select using (public.can_access_child(child_id) or public.is_admin());
create policy cg_modify on public.child_guardians
  for all using (public.is_admin())
  with check (public.is_admin());

alter table public.share_access enable row level security;
create policy sa_select on public.share_access
  for select using (
    public.is_admin() or public.is_guardian_of(auth.uid(), child_id) or doctor_user_id = auth.uid()
  );
create policy sa_modify on public.share_access
  for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

-- =========================================================
-- D) Continue with the rest of the schema (unchanged order, funcs now available)
--    (Food catalog, plans, meals, measurements, boluses, prefs, growth, labs, attachments,
--     visits/notes/tasks, settings, rewards, enhancements, triggers, RPCs)
--    NOTE: identical to previous file sections, just appended after this point.
-- =========================================================

-- 2) Food catalog
create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text,
  aliases text[],
  category text,
  brand text,
  is_liquid boolean default false,
  density_g_per_ml numeric(6,3),
  per100 jsonb,
  image_url text,
  diet_tags_auto text[],
  source text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_food_active on public.food_items(is_active);
create index if not exists idx_food_name on public.food_items using gin ((to_tsvector('simple', coalesce(name_ar,'')||' '||coalesce(name_en,''))));
alter table public.food_items enable row level security;
create policy food_select on public.food_items for select using (true);
create policy food_admin_write on public.food_items for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.food_measures (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.food_items(id) on delete cascade,
  label text not null,
  grams numeric(10,3),
  ml numeric(10,3),
  is_default boolean default false,
  accuracy text check (accuracy in ('low','medium','high')) default 'medium'
);
create unique index if not exists uq_food_measure on public.food_measures(food_id, label);
alter table public.food_measures enable row level security;
create policy fm_select on public.food_measures for select using (true);
create policy fm_admin_write on public.food_measures for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.allergens (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_ar text not null,
  name_en text not null,
  category text,
  is_active boolean default true,
  notes text,
  created_at timestamptz default now()
);
alter table public.allergens enable row level security;
create policy alg_select on public.allergens for select using (true);
create policy alg_admin_write on public.allergens for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.food_allergen_map (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.food_items(id) on delete cascade,
  allergen_id uuid not null references public.allergens(id) on delete cascade,
  relation text not null default 'contains' check (relation in ('contains','may_contain','free_from','unknown')),
  source text default 'label' check (source in ('label','brand','usda','manual','other')),
  confidence smallint default 80,
  notes text,
  created_at timestamptz default now(),
  unique (food_id, allergen_id)
);
alter table public.food_allergen_map enable row level security;
create policy fam_select on public.food_allergen_map for select using (true);
create policy fam_admin_write on public.food_allergen_map for all using (public.is_admin()) with check (public.is_admin());

-- 3) Plans & Targets
create table if not exists public.targets (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  active boolean default true,
  critical_low_mgdl int not null default 50,
  severe_low_mgdl int not null default 60,
  low_mgdl int not null default 70,
  high_mgdl int not null default 180,
  severe_high_mgdl int not null default 250,
  critical_high_mgdl int not null default 300,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_targets_child_eff on public.targets(child_id, effective_from desc);
alter table public.targets enable row level security;
create policy tgt_select on public.targets for select using (public.can_access_child(child_id) or public.is_admin());
create policy tgt_write on public.targets for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.insulin_plan (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  active boolean default true,
  carb_ratio_g_per_unit numeric(6,2),
  icr_schedule jsonb,
  correction_factor_mgdl_per_unit numeric(6,2) not null,
  correction_target_mgdl int not null,
  dose_increment_units numeric(4,2) not null default 0.5,
  min_correction_units numeric(5,2) default 0,
  max_correction_units numeric(6,2),
  max_total_meal_units numeric(6,2),
  min_interval_minutes_between_corrections smallint default 120,
  carb_rounding_grams smallint default 0,
  use_iob boolean default false,
  sickday_factor numeric(4,2),
  iob_dia_hours numeric(3,1) default 4.0,
  iob_peak_minutes smallint default 75,
  iob_curve text default 'walsh',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_ip_child_eff on public.insulin_plan(child_id, effective_from desc);
alter table public.insulin_plan enable row level security;
create policy ip_select on public.insulin_plan for select using (public.can_access_child(child_id) or public.is_admin());
create policy ip_write on public.insulin_plan for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.child_carb_goals (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  active boolean default true,
  evaluation_basis text not null default 'net' check (evaluation_basis in ('net','total')),
  daily_goal_g numeric(6,2),
  per_meal jsonb,
  weekday_overrides jsonb,
  tolerance_g numeric(5,2) default 0,
  tolerance_pct numeric(5,2),
  max_snacks_per_day smallint,
  kcal_goal numeric(6,2),
  macro_targets jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_ccg_child_eff on public.child_carb_goals(child_id, effective_from desc);
alter table public.child_carb_goals enable row level security;
create policy ccg_select on public.child_carb_goals for select using (public.can_access_child(child_id) or public.is_admin());
create policy ccg_write on public.child_carb_goals for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

-- 4) Meals & Measurements & Boluses
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  datetime timestamptz not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  fiber_policy text not null default 'net' check (fiber_policy in ('total','net','half_rule')),
  total_carbs numeric(10,3) not null default 0,
  total_fiber numeric(10,3) not null default 0,
  net_carbs numeric(10,3) not null default 0,
  kcal_total numeric(10,2) not null default 0,
  calc_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_meals_child_dt on public.meals(child_id, datetime desc);
alter table public.meals enable row level security;
create policy meals_select on public.meals for select using (public.can_access_child(child_id) or public.is_admin());
create policy meals_write on public.meals for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  food_id uuid references public.food_items(id),
  measure_id uuid references public.food_measures(id),
  name_snapshot text not null,
  grams numeric(10,3) not null,
  carbs_per_100g numeric(10,3),
  fiber_per_100g numeric(10,3),
  kcal_per_100g numeric(10,3),
  carbs_total numeric(10,3) not null default 0,
  fiber_total numeric(10,3) not null default 0,
  kcal_total numeric(10,3) not null default 0,
  allergens_snapshot jsonb,
  allergy_conflict boolean not null default false,
  order_index smallint not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists idx_meal_items_meal on public.meal_items(meal_id, order_index);
alter table public.meal_items enable row level security;
create policy mi_select on public.meal_items for select
  using (exists (select 1 from public.meals m where m.id = meal_id and (public.can_access_child(m.child_id) or public.is_admin())));
create policy mi_write on public.meal_items for all
  using (exists (select 1 from public.meals m where m.id = meal_id and (public.is_admin() or public.is_guardian_of(auth.uid(), m.child_id))))
  with check (exists (select 1 from public.meals m where m.id = meal_id and (public.is_admin() or public.is_guardian_of(auth.uid(), m.child_id))));

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  observed_at timestamptz not null,
  glucose_mgdl int not null check (glucose_mgdl between 20 and 800),
  source text default 'manual',
  context_timing text check (context_timing in ('wake','pre','post','bedtime','random')),
  context_meal_type text check (context_meal_type in ('breakfast','lunch','dinner','snack')),
  anchor_meal_id uuid references public.meals(id) on delete set null,
  series_id uuid,
  series_seq smallint,
  time_accuracy text default 'exact' check (time_accuracy in ('exact','estimated')),
  created_at timestamptz not null default now()
);
create index if not exists idx_meas_child_time on public.measurements(child_id, observed_at desc);
alter table public.measurements enable row level security;
create policy meas_select on public.measurements for select using (public.can_access_child(child_id) or public.is_admin());
create policy meas_write on public.measurements for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.boluses (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  type text not null check (type in ('meal','correction','combo','extended')),
  started_at timestamptz not null,
  duration_minutes smallint default 0,
  meal_id uuid references public.meals(id) on delete set null,
  measurement_id uuid references public.measurements(id) on delete set null,
  device_id text,
  device_event_id text,
  units_total numeric(6,2) not null,
  units_meal numeric(6,2) default 0,
  units_correction numeric(6,2) default 0,
  units_immediate numeric(6,2),
  units_extended numeric(6,2),
  method text default 'pen' check (method in ('pen','pump','syringe','other')),
  insulin_type text default 'rapid' check (insulin_type in ('rapid','ultra_rapid','regular','other')),
  calc_snapshot jsonb,
  recommended_total numeric(6,2),
  recommended_by text default 'app',
  entered_by_user_id uuid references public.profiles(user_id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_boluses_child_time on public.boluses(child_id, started_at desc);
create unique index if not exists uq_bolus_device_event on public.boluses(child_id, device_id, device_event_id) where device_event_id is not null;
alter table public.boluses enable row level security;
create policy bol_select on public.boluses for select using (public.can_access_child(child_id) or public.is_admin());
create policy bol_write on public.boluses for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

-- 5) Allergies & Prefs
create table if not exists public.child_allergies (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  allergen_id uuid not null references public.allergens(id) on delete restrict,
  severity text not null check (severity in ('mild','moderate','severe','anaphylaxis')),
  status text not null default 'active' check (status in ('active','resolved')),
  reaction text,
  source text default 'parent' check (source in ('parent','doctor','test','other')),
  confirmed_at timestamptz,
  last_reviewed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  unique (child_id, allergen_id, status)
);
create unique index if not exists uq_child_allergy_active on public.child_allergies(child_id, allergen_id) where status = 'active';
alter table public.child_allergies enable row level security;
create policy ca_select on public.child_allergies for select using (public.can_access_child(child_id) or public.is_admin());
create policy ca_write on public.child_allergies for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.child_food_prefs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  food_id uuid references public.food_items(id) on delete set null,
  preference text not null check (preference in ('prefer','neutral','avoid','ban')),
  reason text not null check (reason in ('allergy','intolerance','religion','dislike','medical','other')),
  label text,
  active boolean default true,
  notes text,
  created_at timestamptz default now()
);
create unique index if not exists uq_child_food_pref on public.child_food_prefs(child_id, food_id) where active = true and food_id is not null;
alter table public.child_food_prefs enable row level security;
create policy cfp_select on public.child_food_prefs for select using (public.can_access_child(child_id) or public.is_admin());
create policy cfp_write on public.child_food_prefs for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

-- 6) Growth & Labs
create table if not exists public.child_growth (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  measured_at timestamptz not null,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  bmi numeric(5,2),
  reference text,
  z_height numeric(5,2), p_height numeric(5,2),
  z_weight numeric(5,2), p_weight numeric(5,2),
  z_bmi numeric(5,2), p_bmi numeric(5,2),
  calc_snapshot jsonb,
  method_height text,
  method_weight text,
  conditions jsonb,
  is_outlier boolean default false,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_growth_child_time on public.child_growth(child_id, measured_at desc);
alter table public.child_growth enable row level security;
create policy gr_select on public.child_growth for select using (public.can_access_child(child_id) or public.is_admin());
create policy gr_write on public.child_growth for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  collected_at timestamptz not null,
  reported_at timestamptz,
  status text default 'final' check (status in ('ordered','collected','in_lab','final','corrected','cancelled')),
  fasting boolean,
  sample_type text,
  lab_name text,
  order_ref text,
  report_file_path text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_labs_child_time on public.labs(child_id, collected_at desc);
alter table public.labs enable row level security;
create policy labs_select on public.labs for select using (public.can_access_child(child_id) or public.is_admin());
create policy labs_write on public.labs for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.lab_items (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references public.labs(id) on delete cascade,
  analyte_code text not null,
  analyte_name_ar text not null,
  loinc_code text,
  value_num numeric(10,3) not null,
  unit text not null,
  decimals smallint default 1,
  ref_low numeric(10,3),
  ref_high numeric(10,3),
  ref_text text,
  ref_source text,
  age_months_at_test smallint,
  sex_at_test text,
  flag text,
  glucose_mgdl numeric(10,2),
  eag_mgdl numeric(10,1),
  method text,
  created_at timestamptz default now()
);
create index if not exists idx_lab_items_lab on public.lab_items(lab_id);
alter table public.lab_items enable row level security;
create policy li_select on public.lab_items for select
  using (exists (select 1 from public.labs l where l.id = lab_id and (public.can_access_child(l.child_id) or public.is_admin())));
create policy li_write on public.lab_items for all
  using (exists (select 1 from public.labs l where l.id = lab_id and (public.is_admin() or public.is_guardian_of(auth.uid(), l.child_id))))
  with check (exists (select 1 from public.labs l where l.id = lab_id and (public.is_admin() or public.is_guardian_of(auth.uid(), l.child_id))));

-- 7) Attachments
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(user_id) on delete set null,
  category text not null check (category in ('lab_report','meal_photo','child_avatar','device_export','doctor_note_file','other')),
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  checksum_sha256 text,
  lab_id uuid references public.labs(id) on delete set null,
  meal_id uuid references public.meals(id) on delete set null,
  measurement_id uuid references public.measurements(id) on delete set null,
  note_id uuid,
  taken_at timestamptz,
  source text default 'web' check (source in ('web','mobile','import','device')),
  tags jsonb,
  is_deleted boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_att_child_time on public.attachments(child_id, created_at desc);
alter table public.attachments enable row level security;
create policy att_select on public.attachments for select using (public.can_access_child(child_id) or public.is_admin());
create policy att_write on public.attachments for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

-- 8) Visits & Notes & Tasks
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  clinician_user_id uuid references public.profiles(user_id) on delete set null,
  visit_type text not null default 'clinic' check (visit_type in ('clinic','tele','phone','home','other')),
  status text not null default 'scheduled' check (status in ('scheduled','completed','no_show','cancelled')),
  scheduled_at timestamptz not null,
  started_at timestamptz,
  ended_at timestamptz,
  duration_minutes smallint,
  reason text,
  agenda text,
  vitals_snapshot jsonb,
  previsit_summary jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_visits_child_time on public.visits(child_id, scheduled_at desc);
alter table public.visits enable row level security;
create policy v_select on public.visits for select using (public.can_access_child(child_id) or public.is_admin());
create policy v_write on public.visits for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.doctor_notes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  visit_id uuid references public.visits(id) on delete set null,
  doctor_user_id uuid not null references public.profiles(user_id) on delete cascade,
  note_type text default 'soap' check (note_type in ('soap','summary','instruction')),
  subjective text,
  objective text,
  assessment text,
  plan text,
  plan_changes jsonb,
  icd10_codes text[],
  share_with_parent boolean default true,
  share_with_child boolean default false,
  visibility text default 'parent_doctor_admin',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_notes_child_time on public.doctor_notes(child_id, created_at desc);
alter table public.doctor_notes enable row level security;
create policy dn_select on public.doctor_notes for select using (
  public.can_access_child(child_id) or public.is_admin()
);
create policy dn_insert on public.doctor_notes for insert with check (
  public.is_admin() or
  exists(select 1 from public.share_access s where s.child_id = child_id and s.doctor_user_id = auth.uid() and s.active = true and (s.expires_at is null or s.expires_at > now()) and 'comment' = any(s.scopes))
);
create policy dn_update on public.doctor_notes for update using (
  public.is_admin() or doctor_user_id = auth.uid()
);

create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(user_id) on delete set null,
  assigned_to_user_id uuid references public.profiles(user_id) on delete set null,
  visit_id uuid references public.visits(id) on delete set null,
  title text not null,
  details text,
  category text check (category in ('measurement','lab','education','nutrition','other')),
  priority text default 'normal' check (priority in ('low','normal','high')),
  due_at timestamptz,
  rrule text,
  status text not null default 'open' check (status in ('open','done','skipped','cancelled')),
  points_reward int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_tasks_child_time on public.care_tasks(child_id, created_at desc);
alter table public.care_tasks enable row level security;
create policy ct_select on public.care_tasks for select using (public.can_access_child(child_id) or public.is_admin());
create policy ct_write on public.care_tasks for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

-- 9) Settings & Policies
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  locale text default 'ar',
  timezone text default 'Asia/Kuwait',
  date_format text default 'DD/MM/YYYY',
  unit_glucose text default 'mg/dL' check (unit_glucose in ('mg/dL','mmol/L')),
  unit_weight text default 'kg',
  unit_height text default 'cm',
  default_meal_times jsonb,
  pre_window_mins smallint default 45,
  post_window_mins smallint default 120,
  fiber_policy_default text default 'net' check (fiber_policy_default in ('total','net','half_rule')),
  polyol_factor jsonb,
  alert_low_repeat_minutes smallint,
  alert_high_repeat_minutes smallint,
  notify_email boolean default false,
  notify_push boolean default false,
  default_time_accuracy text default 'exact' check (default_time_accuracy in ('exact','estimated')),
  auto_series_gap_minutes smallint
);
alter table public.user_settings enable row level security;
create policy us_select on public.user_settings for select using (auth.uid() = user_id or public.is_admin());
create policy us_write on public.user_settings for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create table if not exists public.child_diet_profile (
  child_id uuid primary key references public.children(id) on delete cascade,
  halal boolean default false,
  vegetarian boolean default false,
  vegan boolean default false,
  gluten_free boolean default false,
  lactose_free boolean default false,
  low_carb boolean default false,
  low_sugar boolean default false,
  low_fat boolean default false,
  low_sat_fat boolean default false,
  low_sodium boolean default false,
  allergy_enforcement text not null default 'block' check (allergy_enforcement in ('block','warn')),
  fiber_policy text not null default 'net' check (fiber_policy in ('total','net','half_rule')),
  half_rule_threshold_g smallint default 5,
  daily_schedule_override jsonb,
  updated_at timestamptz default now()
);
alter table public.child_diet_profile enable row level security;
create policy cdp_select on public.child_diet_profile for select using (public.can_access_child(child_id) or public.is_admin());
create policy cdp_write on public.child_diet_profile for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.child_settings (
  child_id uuid primary key references public.children(id) on delete cascade,
  duplicate_measurement_minutes smallint,
  min_series_gap_minutes smallint,
  allow_correction_without_pre_bg boolean default false,
  rounding_display text default 'nearest' check (rounding_display in ('nearest','down','up'))
);
alter table public.child_settings enable row level security;
create policy cs_select on public.child_settings for select using (public.can_access_child(child_id) or public.is_admin());
create policy cs_write on public.child_settings for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  type text not null check (type in ('low','high','lab_ready','visit_reminder','task_due')),
  payload jsonb,
  status text not null default 'sent' check (status in ('sent','read')),
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy notif_select on public.notifications for select using (auth.uid() = user_id or public.is_admin());
create policy notif_write on public.notifications for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  consent_type text not null check (consent_type in ('data_processing','doctor_share','email_notifications')),
  granted boolean not null,
  granted_at timestamptz not null default now(),
  notes text
);
alter table public.consents enable row level security;
create policy cons_select on public.consents for select using (auth.uid() = user_id or public.is_admin());
create policy cons_write on public.consents for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- 10) Rewards
create table if not exists public.rewards_points_ledger (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  occurred_on date not null,
  points int not null,
  reason_code text not null,
  source text default 'system' check (source in ('system','manual','doctor','import')),
  measurement_id uuid references public.measurements(id) on delete set null,
  meal_id uuid references public.meals(id) on delete set null,
  care_task_id uuid references public.care_tasks(id) on delete set null,
  lab_id uuid references public.labs(id) on delete set null,
  meta jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_rewards_day on public.rewards_points_ledger(child_id, occurred_on desc);
alter table public.rewards_points_ledger enable row level security;
create policy rpl_select on public.rewards_points_ledger for select using (public.can_access_child(child_id) or public.is_admin());
create policy rpl_write on public.rewards_points_ledger for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.rewards_daily_scores (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  day date not null,
  tir_pct numeric(5,2),
  tbr_events int,
  thr_events int,
  routine_completed boolean,
  routine_slots_done smallint,
  meals_within_goal smallint,
  snacks_within_goal smallint,
  low_treated_ok boolean,
  points_total int default 0,
  awards_snapshot jsonb,
  finalized_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (child_id, day)
);
alter table public.rewards_daily_scores enable row level security;
create policy rds_select on public.rewards_daily_scores for select using (public.can_access_child(child_id) or public.is_admin());
create policy rds_write on public.rewards_daily_scores for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.rewards_achievements_catalog (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_ar text not null,
  name_en text,
  description_ar text,
  points_bonus int default 0,
  icon text,
  active boolean default true,
  rules jsonb,
  created_at timestamptz default now()
);
alter table public.rewards_achievements_catalog enable row level security;
create policy rac_select on public.rewards_achievements_catalog for select using (true);
create policy rac_admin on public.rewards_achievements_catalog for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.rewards_child_achievements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  achievement_code text not null,
  earned_at timestamptz not null,
  meta jsonb,
  unique(child_id, achievement_code)
);
alter table public.rewards_child_achievements enable row level security;
create policy rca_select on public.rewards_child_achievements for select using (public.can_access_child(child_id) or public.is_admin());
create policy rca_write on public.rewards_child_achievements for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.rewards_catalog (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cost_points int not null,
  image_url text,
  active boolean default true,
  stock int
);
alter table public.rewards_catalog enable row level security;
create policy rc_select on public.rewards_catalog for select using (true);
create policy rc_admin on public.rewards_catalog for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.rewards_redemptions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  reward_id uuid not null references public.rewards_catalog(id) on delete restrict,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected','fulfilled')),
  approved_by_user_id uuid references public.profiles(user_id) on delete set null,
  notes text
);
alter table public.rewards_redemptions enable row level security;
create policy rr_select on public.rewards_redemptions for select using (public.can_access_child(child_id) or public.is_admin());
create policy rr_write on public.rewards_redemptions for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

-- 11) Enhancements
create table if not exists public.app_config (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);
alter table public.app_config enable row level security;
create policy appcfg_read on public.app_config for select using (true);
create policy appcfg_admin on public.app_config for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.meal_templates (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles(user_id) on delete set null,
  title text not null,
  items jsonb not null,
  meal_type text check (meal_type in ('breakfast','lunch','dinner','snack')),
  is_public boolean default false,
  created_at timestamptz default now()
);
alter table public.meal_templates enable row level security;
create policy mt_select on public.meal_templates for select using (is_public = true or owner_user_id = auth.uid() or public.is_admin());
create policy mt_write on public.meal_templates for all using (owner_user_id = auth.uid() or public.is_admin())
  with check (owner_user_id = auth.uid() or public.is_admin());

create table if not exists public.meal_favorites (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  title text not null,
  template_id uuid references public.meal_templates(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.meal_favorites enable row level security;
create policy mf_select on public.meal_favorites for select using (public.can_access_child(child_id) or public.is_admin());
create policy mf_write on public.meal_favorites for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.education_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_md text not null,
  audience text default 'parent_child' check (audience in ('parent','child','parent_child')),
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.education_content enable row level security;
create policy ec_select on public.education_content for select using (true);
create policy ec_admin on public.education_content for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.education_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  content_id uuid not null references public.education_content(id) on delete cascade,
  completed_at timestamptz,
  quiz_score numeric(5,2),
  created_at timestamptz default now(),
  unique(child_id, content_id)
);
alter table public.education_progress enable row level security;
create policy ep_select on public.education_progress for select using (public.can_access_child(child_id) or public.is_admin());
create policy ep_write on public.education_progress for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.device_sources (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  vendor text,
  model text,
  serial text,
  connected_at timestamptz default now(),
  meta jsonb
);
alter table public.device_sources enable row level security;
create policy ds_select on public.device_sources for select using (public.can_access_child(child_id) or public.is_admin());
create policy ds_write on public.device_sources for all using (public.is_admin() or public.is_guardian_of(auth.uid(), child_id))
  with check (public.is_admin() or public.is_guardian_of(auth.uid(), child_id));

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.children(id) on delete cascade,
  source text,
  status text not null default 'pending' check (status in ('pending','running','done','error')),
  started_at timestamptz,
  finished_at timestamptz,
  file_path text,
  error text,
  stats jsonb
);
alter table public.import_jobs enable row level security;
create policy ij_select on public.import_jobs for select using (public.is_admin() or (child_id is not null and public.can_access_child(child_id)));
create policy ij_write on public.import_jobs for all using (public.is_admin());

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete set null,
  child_id uuid references public.children(id) on delete set null,
  entity text not null,
  entity_id uuid,
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);
alter table public.audit_events enable row level security;
create policy audit_read on public.audit_events for select using (public.is_admin());
create policy audit_write on public.audit_events for insert with check (true);

-- 12) Triggers
create or replace function public.recompute_meal_totals(p_meal_id uuid)
returns void language plpgsql as $$
begin
  update public.meals m
  set total_carbs = coalesce(t.sum_carbs,0),
      total_fiber = coalesce(t.sum_fiber,0),
      net_carbs   = greatest(coalesce(t.sum_carbs,0) - coalesce(t.sum_fiber,0), 0),
      kcal_total  = coalesce(t.sum_kcal,0),
      updated_at  = now()
  from (
    select meal_id,
           sum(coalesce(carbs_total,0)) as sum_carbs,
           sum(coalesce(fiber_total,0)) as sum_fiber,
           sum(coalesce(kcal_total,0))  as sum_kcal
    from public.meal_items
    where meal_id = p_meal_id
    group by meal_id
  ) t
  where m.id = p_meal_id;
end $$;

create or replace function public.trg_meal_items_recompute()
returns trigger language plpgsql as $$
declare _meal uuid;
begin
  _meal := coalesce(new.meal_id, old.meal_id);
  perform public.recompute_meal_totals(_meal);
  return coalesce(new, old);
end $$;

create or replace function public.trg_meal_items_before()
returns trigger language plpgsql as $$
declare
  v_child uuid;
  v_policy text;
  v_conflict_count int;
  v_allergens jsonb;
begin
  if new.carbs_per_100g is not null then
    new.carbs_total := round((coalesce(new.grams,0) * new.carbs_per_100g)/100.0, 3);
  end if;
  if new.fiber_per_100g is not null then
    new.fiber_total := round((coalesce(new.grams,0) * new.fiber_per_100g)/100.0, 3);
  end if;
  if new.kcal_per_100g is not null then
    new.kcal_total := round((coalesce(new.grams,0) * new.kcal_per_100g)/100.0, 3);
  end if;

  select m.child_id into v_child from public.meals m where m.id = new.meal_id;
  if v_child is null then
    raise exception 'Meal not found for meal_item';
  end if;

  select coalesce(dp.allergy_enforcement,'block') into v_policy
  from public.child_diet_profile dp where dp.child_id = v_child;

  select count(*), coalesce(jsonb_agg(a.code), '[]'::jsonb)
  into v_conflict_count, v_allergens
  from public.food_allergen_map fam
  join public.allergens a on a.id = fam.allergen_id
  where fam.food_id = coalesce(new.food_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and fam.relation in ('contains','may_contain')
    and exists (
      select 1 from public.child_allergies ca
      where ca.child_id = v_child and ca.allergen_id = fam.allergen_id and ca.status = 'active'
    );

  new.allergens_snapshot := case when v_conflict_count > 0 then v_allergens else '[]'::jsonb end;
  new.allergy_conflict := (v_conflict_count > 0);

  if v_conflict_count > 0 and v_policy = 'block' then
    raise exception 'Allergy conflict with child policy = block (allergens=%)', v_allergens;
  end if;

  return new;
end $$;

drop trigger if exists meal_items_before on public.meal_items;
create trigger meal_items_before
  before insert or update on public.meal_items
  for each row execute function public.trg_meal_items_before();

drop trigger if exists meal_items_recompute on public.meal_items;
create trigger meal_items_recompute
  after insert or update or delete on public.meal_items
  for each row execute function public.trg_meal_items_recompute();

-- 13) RPC stubs
create or replace function public.rpc_pick_pre_meal_bg(p_child_id uuid, p_meal_type text, p_meal_datetime timestamptz)
returns jsonb language sql stable as $$
  with params as (
    select
      coalesce((select pre_window_mins from public.user_settings us where us.user_id = auth.uid()), 45) as pre_mins
  )
  select to_jsonb(mm) from (
    select m.id as measurement_id, m.observed_at, m.glucose_mgdl
    from public.measurements m, params p
    where m.child_id = p_child_id
      and m.observed_at <= p_meal_datetime
      and m.observed_at >= p_meal_datetime - (p.pre_mins || ' minutes')::interval
    order by m.observed_at desc
    limit 1
  ) mm;
$$;

create or replace function public.rpc_calculate_correction_dose(p_child_id uuid, p_glucose int, p_observed_at timestamptz)
returns jsonb language plpgsql stable as $$
declare
  v_isf numeric;
  v_target int;
  v_inc numeric := 0.5;
  v_min_corr numeric := 0;
  v_max_corr numeric;
  v_zone text := 'in_range';
  v_severe_high int := 250;
  v_units_raw numeric := 0;
  v_units_rounded numeric := 0;
begin
  select ip.correction_factor_mgdl_per_unit, ip.correction_target_mgdl, ip.dose_increment_units, ip.min_correction_units, ip.max_correction_units
  into v_isf, v_target, v_inc, v_min_corr, v_max_corr
  from public.insulin_plan ip
  where ip.child_id = p_child_id and ip.active = true
  order by ip.effective_from desc limit 1;

  select t.severe_high_mgdl into v_severe_high
  from public.targets t where t.child_id = p_child_id and t.active = true
  order by t.effective_from desc limit 1;

  if p_glucose is null or v_isf is null or v_target is null then
    return jsonb_build_object('error','missing_inputs');
  end if;

  if p_glucose >= v_severe_high then v_zone := 'severe_high';
  elsif p_glucose > v_target then v_zone := 'high';
  elsif p_glucose < v_target then v_zone := 'below_target';
  end if;

  if p_glucose > v_target then
    v_units_raw := (p_glucose - v_target) / v_isf;
    if v_units_raw < v_min_corr then v_units_raw := v_min_corr; end if;
    if v_max_corr is not null and v_units_raw > v_max_corr then v_units_raw := v_max_corr; end if;
    v_units_rounded := round(v_units_raw / v_inc) * v_inc;
  end if;

  return jsonb_build_object(
    'zone', v_zone,
    'isf', v_isf,
    'target', v_target,
    'raw', v_units_raw,
    'rounded', v_units_rounded,
    'increment', v_inc,
    'limits', jsonb_build_object('min_corr', v_min_corr, 'max_corr', v_max_corr)
  );
end $$;

create or replace function public.rpc_upsert_meal_with_items(p_payload jsonb)
returns uuid language plpgsql as $$
declare
  v_meal_id uuid;
  v_child uuid;
  v_dt timestamptz;
  v_type text;
  v_policy text;
  v_item jsonb;
begin
  v_child := (p_payload->>'child_id')::uuid;
  v_dt    := (p_payload->>'datetime')::timestamptz;
  v_type  := (p_payload->>'meal_type')::text;
  v_policy:= coalesce(p_payload->>'fiber_policy','net');

  insert into public.meals(id, child_id, datetime, meal_type, fiber_policy)
  values (coalesce((p_payload->>'id')::uuid, gen_random_uuid()), v_child, v_dt, v_type, v_policy)
  on conflict (id) do update set datetime=excluded.datetime, meal_type=excluded.meal_type, fiber_policy=excluded.fiber_policy, updated_at=now()
  returning id into v_meal_id;

  if coalesce((p_payload->>'replace_items')::boolean, false) then
    delete from public.meal_items where meal_id = v_meal_id;
  end if;

  for v_item in select jsonb_array_elements(coalesce(p_payload->'items','[]'::jsonb))
  loop
    insert into public.meal_items(
      meal_id, food_id, measure_id, name_snapshot, grams,
      carbs_per_100g, fiber_per_100g, kcal_per_100g, order_index
    )
    values (
      v_meal_id,
      (v_item->>'food_id')::uuid,
      (v_item->>'measure_id')::uuid,
      coalesce(v_item->>'name_snapshot','item'),
      coalesce((v_item->>'grams')::numeric,0),
      (v_item->>'carbs_per_100g')::numeric,
      (v_item->>'fiber_per_100g')::numeric,
      (v_item->>'kcal_per_100g')::numeric,
      coalesce((v_item->>'order_index')::int, 1)
    );
  end loop;

  perform public.recompute_meal_totals(v_meal_id);
  return v_meal_id;
end $$;

create or replace function public.rpc_link_measurements_to_meal(p_meal_id uuid)
returns void language sql as $$
  select null::void;
$$;

create or replace function public.rpc_award_daily_points(p_child_id uuid, p_day date)
returns jsonb language sql as $$
  select jsonb_build_object('status','ok','message','stub');
$$;

commit;
