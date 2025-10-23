db-schema v1.1 — جداول وحقول
profiles
field	type	required	notes
id	uuid	نعم	PK
auth_user_id	uuid	نعم	فريد ويرتبط بـ Supabase Auth
full_name	string	نعم	—
phone	string	لا	يفضّل فريد عند توفره
role_hint	string	لا	guardian|doctor|dietitian|admin (إرشادي)
is_active	boolean	نعم	افتراضي true
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
roles
field	type	required	notes
id	uuid	نعم	PK
slug	string	نعم	فريد (guardian|doctor|dietitian|admin)
name	string	نعم	اسم العرض
description	text	لا	—
is_system	boolean	نعم	للأدوار الأساسية
is_active	boolean	نعم	—
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
user_roles
field	type	required	notes
id	uuid	نعم	PK
profile_id	uuid	نعم	FK → profiles.id
role_id	uuid	نعم	FK → roles.id
is_primary	boolean	لا	دور أساسي؟
is_active	boolean	نعم	افتراضي true
assigned_by	uuid	لا	FK → profiles.id
assigned_at	timestamp	نعم	—
source	string	لا	admin|self|system|sync
note	text	لا	—
updated_at	timestamp	نعم	—
children
field	type	required	notes
id	uuid	نعم	PK
guardian_id	uuid	نعم	FK → profiles.id
full_name	string	نعم	—
dob	date	نعم	تاريخ الميلاد
sex	string	لا	M|F|X
diabetes_type	string	لا	T1D|T2D|MODY|Other
diagnosis_date	date	لا	—
mrn	string	لا	رقم ملف طبي
care_center	string	لا	—
height_cm	number	لا	آخر طول مُلخّص
weight_kg	number	لا	آخر وزن مُلخّص
bmi	number	لا	مُشتق
metrics_measured_at	timestamp	لا	وقت آخر قياس
metrics_source	string	لا	clinic|home|device|import
allergies_summary	text	لا	للعرض فقط
devices_summary	text	لا	للعرض فقط
status	string	نعم	active|inactive|archived
notes	text	لا	—
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
growth_metrics
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
measured_at	timestamp	نعم	وقت القياس
height_cm	number	لا	—
weight_kg	number	لا	—
bmi	number	لا	مُشتق
waist_cm	number	لا	اختياري
p_height	number	لا	Percentile
p_weight	number	لا	Percentile
p_bmi	number	لا	Percentile
source	string	لا	clinic|home|device|import
note	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
doctor_children
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
doctor_profile_id	uuid	نعم	FK → profiles.id
status	string	نعم	active|paused|ended
assigned_at	timestamp	نعم	—
ended_at	timestamp	لا	—
notes	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
dietitian_children
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
dietitian_profile_id	uuid	نعم	FK → profiles.id
status	string	نعم	active|paused|ended
assigned_at	timestamp	نعم	—
ended_at	timestamp	لا	—
notes	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
child_diabetes_profiles
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
version_no	number	نعم	رقم الإصدار
status	string	نعم	active|superseded|draft
effective_from	date	نعم	بداية السريان
effective_to	date	لا	نهاية السريان (اختياري)
therapy_type	string	نعم	MDI|Pump
basal_insulin_name	string	لا	للـMDI
bolus_insulin_name	string	لا	—
target_min_default	number	لا	mg/dL
target_max_default	number	لا	mg/dL
carb_ratio_default	number	لا	g/U (Fallback)
corr_factor_default	number	نعم	mg/dL per U (ثابت)
dia_hours	number	لا	مدة تأثير الأنسولين
rounding_step_u	number	لا	خطوة التقريب
max_bolus_u	number	لا	—
max_daily_basal_u	number	لا	—
hypo_threshold	number	نعم	حد الانخفاض mg/dL
hyper_threshold	number	نعم	حد الارتفاع mg/dL
hyper_critical_threshold	number	نعم	حد الارتفاع الحرج mg/dL
hyper_repeat_window_min	number	لا	نافذة التكرار (دقائق)
hyper_repeat_count	number	لا	مرات التكرار داخل النافذة
postprandial_window_min	number	لا	نافذة ما بعد الوجبة (دقائق)
pump_model	string	لا	—
cgm_model	string	لا	—
source	string	لا	clinic|self|import|system
notes	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
published_at	timestamp	لا	—
diabetes_targets
field	type	required	notes
id	uuid	نعم	PK
diabetes_profile_id	uuid	نعم	FK → child_diabetes_profiles.id
time_block	string	نعم	breakfast|lunch|dinner|snack|overnight|school|custom
target_min	number	نعم	mg/dL
target_max	number	نعم	mg/dL
notes	text	لا	—
created_at	timestamp	نعم	—
carb_goals_per_meal
field	type	required	notes
id	uuid	نعم	PK
diabetes_profile_id	uuid	نعم	FK → child_diabetes_profiles.id
meal_type	string	نعم	breakfast|lunch|dinner|snack
target_carb_min_g	number	نعم	غرام
target_carb_max_g	number	نعم	غرام
recommended_carb_g	number	لا	غرام
fiber_adjustment_g	number	لا	خصم ألياف
notes	text	لا	—
created_at	timestamp	نعم	—
carb_ratio_per_meal
field	type	required	notes
id	uuid	نعم	PK
diabetes_profile_id	uuid	نعم	FK → child_diabetes_profiles.id
meal_type	string	نعم	breakfast|lunch|dinner|snack
carb_ratio_g_per_u	number	نعم	g/U
active_on_days	string	لا	weekdays|weekends
notes	text	لا	—
created_at	timestamp	نعم	—
basal_profile_segments
field	type	required	notes
id	uuid	نعم	PK
diabetes_profile_id	uuid	نعم	FK → child_diabetes_profiles.id
start_minute_of_day	number	نعم	0..1439
duration_min	number	نعم	>0 وبلا تجاوز لليوم
rate_u_per_h	number	نعم	وحدات/ساعة
label	string	لا	تسمية اختيارية
day_pattern	string	لا	all|weekdays|weekends
notes	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
mdi_basal_doses
field	type	required	notes
id	uuid	نعم	PK
diabetes_profile_id	uuid	نعم	FK → child_diabetes_profiles.id
dose_time_minute_of_day	number	نعم	0..1439
units	number	نعم	>0
insulin_name	string	لا	تجاوز للاسم الافتراضي
day_pattern	string	لا	all|weekdays|weekends
notes	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
glucose_readings
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
taken_at	timestamp	نعم	وقت القياس
source	string	نعم	cgm|fingerstick|manual|import
value_mgdl	number	نعم	>0
trend	number	لا	ميل/اتجاه
context	string	لا	fasting|premeal|postmeal|exercise|bedtime|overnight|sickday|other
tag	string	لا	—
related_meal_id	uuid	لا	FK → meals.id
gly_zone	string	لا	low|in_range|high|critical_high (مُشتق)
is_repeat_critical	boolean	لا	مُشتق نافذة التكرار
classed_at	timestamp	لا	وقت التصنيف
note	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
insulin_doses
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
given_at	timestamp	نعم	وقت الجرعة
dose_type	string	نعم	basal|bolus|correction
insulin_name	string	نعم	—
units	number	نعم	>0
delivered_by	string	لا	pen|syringe|pump|other
related_meal_id	uuid	لا	FK → meals.id
pre_glucose_mgdl	number	لا	—
target_mgdl	number	لا	—
carb_grams	number	لا	—
carb_ratio_used	number	لا	g/U
corr_factor_used	number	لا	mg/dL per U
calc_carb_units	number	لا	—
calc_corr_units	number	لا	—
override_reason	text	لا	سبب التعديل
notes	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
keto_readings (اختياري)
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
taken_at	timestamp	نعم	—
type	string	نعم	blood|urine
value	number|string	نعم	قيمة القياس
unit	string	نعم	mmol_per_L|strip_scale
class	string	لا	normal|elevated|high (مُشتق)
note	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
food_categories
field	type	required	notes
id	uuid	نعم	PK
slug	string	نعم	فريد
name	string	نعم	—
description	text	لا	—
is_active	boolean	نعم	—
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
food_items
field	type	required	notes
id	uuid	نعم	PK
name	string	نعم	اسم الصنف
category_id	uuid	نعم	FK → food_categories.id
brand	string	لا	—
is_branded	boolean	لا	افتراضي false
lang	string	لا	ar|en …
barcode_gtin	string	لا	—
serving_size	number	لا	حجم الحصة الافتراضي
serving_unit	string	لا	g|ml|piece
carbs_per_100	number	نعم	—
protein_per_100	number	نعم	—
fat_per_100	number	نعم	—
kcal_per_100	number	نعم	—
fiber_per_100	number	لا	—
sugars_per_100	number	لا	—
sodium_mg_per_100	number	لا	—
is_active	boolean	نعم	—
source	string	لا	nutritionist|import|user|usda|other
notes	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
food_portions
field	type	required	notes
id	uuid	نعم	PK
food_item_id	uuid	نعم	FK → food_items.id
measure	string	نعم	اسم المكيال (كوب/قطعة…)
quantity	number	نعم	>0
grams	number	نعم	مكافئ بالجرام/مل
notes	text	لا	—
created_at	timestamp	نعم	—
meals
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
meal_time	timestamp	نعم	وقت الوجبة
meal_type	string	نعم	breakfast|lunch|dinner|snack
total_carbs_g	number	لا	مُجمّع من البنود
total_kcal	number	لا	—
post_window_min	number	لا	تجاوز للنافذة من الخطة
linked_bolus_id	uuid	لا	FK → insulin_doses.id
notes	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
meal_items
field	type	required	notes
id	uuid	نعم	PK
meal_id	uuid	نعم	FK → meals.id
food_item_id	uuid	نعم	FK → food_items.id
quantity	number	نعم	>0
serving_unit	string	لا	عند اختلاف الوحدة
carbs_g	number	نعم	—
kcal	number	لا	—
fiber_g	number	لا	—
net_carbs_g	number	لا	صافي الكارب (اختياري)
note	text	لا	—
diet_plans
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
version_no	number	نعم	—
status	string	نعم	draft|active|superseded
effective_from	date	نعم	—
effective_to	date	لا	—
daily_kcal_target	number	لا	—
daily_carb_target_g	number	لا	—
protein_target_g	number	لا	—
fat_target_g	number	لا	—
notes	text	لا	—
created_by	uuid	لا	FK → profiles.id
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
published_at	timestamp	لا	—
diet_plan_meals
field	type	required	notes
id	uuid	نعم	PK
diet_plan_id	uuid	نعم	FK → diet_plans.id
meal_type	string	نعم	breakfast|lunch|dinner|snack
target_carb_min_g	number	نعم	—
target_carb_max_g	number	نعم	—
recommended_carb_g	number	لا	—
allowed_categories	string	لا	فئات مسموحة
prohibited_items	text	لا	أصناف محظورة
notes	text	لا	—
visits
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
provider_profile_id	uuid	نعم	FK → profiles.id
provider_role	string	نعم	doctor|dietitian
scheduled_at	timestamp	نعم	—
duration_min	number	لا	—
status	string	نعم	scheduled|completed|cancelled|no_show
visit_type	string	لا	followup|adjustment|education|other
summary	text	لا	—
notes	text	لا	—
created_at	timestamp	نعم	—
updated_at	timestamp	نعم	—
visit_recommendations
field	type	required	notes
id	uuid	نعم	PK
visit_id	uuid	نعم	FK → visits.id
title	string	نعم	—
details	text	نعم	خطة/تعليمات
valid_from	date	نعم	—
valid_to	date	لا	NULL = مفتوحة
priority	string	لا	low|normal|high
created_at	timestamp	نعم	—
device_catalog
field	type	required	notes
id	uuid	نعم	PK
brand	string	نعم	—
model	string	نعم	—
type	string	نعم	pump|cgm|pen|meter|other
notes	text	لا	—
is_active	boolean	نعم	—
created_at	timestamp	نعم	—
child_devices
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
device_id	uuid	نعم	FK → device_catalog.id
serial_no	string	لا	—
assigned_from	date	نعم	بداية الربط
assigned_to	date	لا	نهاية الربط
status	string	نعم	active|retired|lost
notes	text	لا	—
created_at	timestamp	نعم	—
attachments
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
visit_id	uuid	لا	FK → visits.id
path	string	نعم	مسار الملف (Storage)
file_name	string	نعم	—
mime_type	string	نعم	—
uploaded_by	uuid	نعم	FK → profiles.id
uploaded_at	timestamp	نعم	—
note	text	لا	—
notifications
field	type	required	notes
id	uuid	نعم	PK
recipient_profile_id	uuid	نعم	FK → profiles.id
child_id	uuid	لا	FK → children.id
type	string	نعم	critical_repeat|visit_update|comment|system
payload	text	لا	بيانات إضافية
is_read	boolean	نعم	—
created_at	timestamp	نعم	—
audit_logs
field	type	required	notes
id	uuid	نعم	PK
actor_profile_id	uuid	نعم	FK → profiles.id
action	string	نعم	نوع الحدث
entity	string	نعم	اسم الكيان
entity_id	uuid	نعم	معرف الكيان
metadata	text	لا	تفاصيل إضافية
created_at	timestamp	نعم	—
analytics_daily
field	type	required	notes
id	uuid	نعم	PK
child_id	uuid	نعم	FK → children.id
day	date	نعم	تاريخ اليوم
avg_glucose	number	لا	—
tir_pct	number	لا	نسبة الوقت ضمن النطاق
hypos_count	number	لا	—
hypers_count	number	لا	من critical_high
repeat_critical_events	number	لا	—
carbs_total_g	number	لا	—
insulin_total_u	number	لا	—
meals_count	number	لا	—
العلاقات (child ↔ parent)

user_roles.profile_id ↔ profiles.id

user_roles.role_id ↔ roles.id

children.guardian_id ↔ profiles.id

growth_metrics.child_id ↔ children.id

doctor_children.child_id ↔ children.id

doctor_children.doctor_profile_id ↔ profiles.id

dietitian_children.child_id ↔ children.id

dietitian_children.dietitian_profile_id ↔ profiles.id

child_diabetes_profiles.child_id ↔ children.id

diabetes_targets.diabetes_profile_id ↔ child_diabetes_profiles.id

carb_goals_per_meal.diabetes_profile_id ↔ child_diabetes_profiles.id

carb_ratio_per_meal.diabetes_profile_id ↔ child_diabetes_profiles.id

basal_profile_segments.diabetes_profile_id ↔ child_diabetes_profiles.id

mdi_basal_doses.diabetes_profile_id ↔ child_diabetes_profiles.id

glucose_readings.child_id ↔ children.id

glucose_readings.related_meal_id ↔ meals.id

insulin_doses.child_id ↔ children.id

insulin_doses.related_meal_id ↔ meals.id

keto_readings.child_id ↔ children.id

food_items.category_id ↔ food_categories.id

food_portions.food_item_id ↔ food_items.id

meals.child_id ↔ children.id

meals.linked_bolus_id ↔ insulin_doses.id

meal_items.meal_id ↔ meals.id

meal_items.food_item_id ↔ food_items.id

diet_plans.child_id ↔ children.id

diet_plan_meals.diet_plan_id ↔ diet_plans.id

visits.child_id ↔ children.id

visits.provider_profile_id ↔ profiles.id

visit_recommendations.visit_id ↔ visits.id

child_devices.child_id ↔ children.id

child_devices.device_id ↔ device_catalog.id

attachments.child_id ↔ children.id

attachments.visit_id ↔ visits.id

attachments.uploaded_by ↔ profiles.id

notifications.recipient_profile_id ↔ profiles.id

notifications.child_id ↔ children.id

audit_logs.actor_profile_id ↔ profiles.id

analytics_daily.child_id ↔ children.id

فهارس مقترحة (مختصرة)

profiles: UNIQUE(auth_user_id), UNIQUE(phone), is_active

roles: UNIQUE(slug), UNIQUE(name), is_active

user_roles: UNIQUE(profile_id, role_id), profile_id, role_id, (profile_id, is_primary), (profile_id, is_active)

children: guardian_id, status, full_name (نصي), dob

growth_metrics: (child_id, measured_at DESC), child_id

doctor_children: UNIQUE(child_id, doctor_profile_id) للحالة active، (doctor_profile_id, status)

dietitian_children: UNIQUE(child_id, dietitian_profile_id) للحالة active، (dietitian_profile_id, status)

child_diabetes_profiles: (child_id, status), (child_id, effective_from DESC)

diabetes_targets: UNIQUE(diabetes_profile_id, time_block)

carb_goals_per_meal: UNIQUE(diabetes_profile_id, meal_type)

carb_ratio_per_meal: UNIQUE(diabetes_profile_id, meal_type)

basal_profile_segments: (diabetes_profile_id, day_pattern, start_minute_of_day)

mdi_basal_doses: (diabetes_profile_id, day_pattern, dose_time_minute_of_day)

glucose_readings: (child_id, taken_at DESC), (child_id, gly_zone, taken_at DESC), (child_id, is_repeat_critical, taken_at DESC)

insulin_doses: (child_id, given_at DESC), (child_id, dose_type, given_at DESC)

keto_readings: (child_id, taken_at DESC)

food_categories: UNIQUE(slug), is_active

food_items: category_id, is_active, (name/brand) نصي، UNIQUE(name, brand, serving_unit) اختياري

food_portions: UNIQUE(food_item_id, measure, quantity)

meals: (child_id, meal_time DESC), (child_id, meal_type, meal_time DESC)

meal_items: meal_id

diet_plans: (child_id, status), (child_id, effective_from DESC)

diet_plan_meals: UNIQUE(diet_plan_id, meal_type)

visits: (child_id, scheduled_at DESC), (provider_profile_id, scheduled_at DESC), status

visit_recommendations: (visit_id, valid_from)

device_catalog: UNIQUE(brand, model), (type, is_active)

child_devices: (child_id, status)

attachments: (child_id, uploaded_at DESC), visit_id

notifications: (recipient_profile_id, is_read, created_at DESC)

audit_logs: (entity, entity_id), (created_at DESC)

analytics_daily: UNIQUE(child_id, day), day

تنبيه: أي إعادة تسمية (Rename) لحقل/جدول تتم عبر تذكرة Rename منفصلة لضمان التتبع والتوافق.
[[END]]
