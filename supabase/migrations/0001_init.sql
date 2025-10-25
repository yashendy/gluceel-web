CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.roles (
slug text PRIMARY KEY,
label text
);

CREATE TABLE IF NOT EXISTS public.children (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
guardian_id uuid NOT NULL,
full_name text,
birth_date date,
sex text,
notes text,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_children_guardian_id ON public.children (guardian_id);

CREATE TABLE IF NOT EXISTS public.doctor_children (
doctor_id uuid NOT NULL,
child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
created_at timestamptz NOT NULL DEFAULT now(),
PRIMARY KEY (doctor_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_children_child_id ON public.doctor_children (child_id);

CREATE TABLE IF NOT EXISTS public.dietitian_children (
dietitian_id uuid NOT NULL,
child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
created_at timestamptz NOT NULL DEFAULT now(),
PRIMARY KEY (dietitian_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_dietitian_children_child_id ON public.dietitian_children (child_id);

CREATE TABLE IF NOT EXISTS public.food_categories (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL UNIQUE,
parent_id uuid REFERENCES public.food_categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_food_categories_parent_id ON public.food_categories(parent_id);

CREATE TABLE IF NOT EXISTS public.units (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
key text NOT NULL UNIQUE,
label text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.food_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL,
category_id uuid REFERENCES public.food_categories(id) ON DELETE SET NULL,
unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
carbs_per_100g numeric(10,2) CHECK (carbs_per_100g >= 0),
calories_per_100g numeric(10,2) CHECK (calories_per_100g >= 0),
protein_per_100g numeric(10,2) CHECK (protein_per_100g >= 0),
fat_per_100g numeric(10,2) CHECK (fat_per_100g >= 0),
image_url text,
created_by uuid,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_items_category_id ON public.food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_unit_id ON public.food_items(unit_id);
CREATE INDEX IF NOT EXISTS idx_food_items_created_by ON public.food_items(created_by);

CREATE TABLE IF NOT EXISTS public.glucose_readings (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
measured_at timestamptz NOT NULL,
value_mg_dl numeric(10,2) NOT NULL CHECK (value_mg_dl >= 0),
context text,
notes text,
created_by uuid,
created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_glucose_readings_child_time ON public.glucose_readings(child_id, measured_at DESC);

CREATE TABLE IF NOT EXISTS public.meals (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
eaten_at timestamptz NOT NULL,
meal_type text,
notes text,
created_by uuid,
created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meals_child_time ON public.meals(child_id, eaten_at DESC);

CREATE TABLE IF NOT EXISTS public.meal_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
meal_id uuid NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
food_item_id uuid NOT NULL REFERENCES public.food_items(id) ON DELETE RESTRICT,
quantity numeric(10,2) NOT NULL CHECK (quantity >= 0),
unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
carbs_est numeric(10,2) CHECK (carbs_est >= 0)
);

CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id ON public.meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_food_item_id ON public.meal_items(food_item_id);

CREATE TABLE IF NOT EXISTS public.appointments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
doctor_id uuid,
dietitian_id uuid,
scheduled_at timestamptz NOT NULL,
status text,
notes text,
created_by uuid,
created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_child_time ON public.appointments(child_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dietitian_id ON public.appointments(dietitian_id);

CREATE TABLE IF NOT EXISTS public.lab_results (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
taken_at timestamptz NOT NULL,
type text,
value text,
unit text,
notes text,
created_by uuid,
created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_results_child_time ON public.lab_results(child_id, taken_at DESC);

CREATE TABLE IF NOT EXISTS public.diet_plans (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
dietitian_id uuid,
starts_on date,
ends_on date,
title text,
notes text,
created_by uuid,
created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diet_plans_child ON public.diet_plans(child_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_dietitian_id ON public.diet_plans(dietitian_id);

CREATE TABLE IF NOT EXISTS public.plan_meals (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
plan_id uuid NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
day_of_week int,
meal_type text,
food_item_id uuid REFERENCES public.food_items(id) ON DELETE RESTRICT,
quantity numeric(10,2) CHECK (quantity >= 0),
unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_plan_meals_plan_id ON public.plan_meals(plan_id);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietitian_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_meals ENABLE ROW LEVEL SECURITY;

COMMIT;
