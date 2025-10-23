docs: adopt db-schema v1.2 (tables, fields, indexes, rls notes)

[[BEGIN]]

gluceel-web — db-schema (v1.2)

هذا المستند هو “مصدر الحقيقة” لأسماء الجداول والحقول. أي Rename/Delete يتم عبر تذكرة منفصلة لضمان التتبّع والتوافق.

0) اتفاقيات عامة

المفاتيح الأساسية: uuid.

الزمن: timestamptz (created_at افتراضي now()، وupdated_at يُحدَّث عبر Trigger لاحقًا).

الكتابة: snake_case، ووحدات واضحة في أسماء الحقول (مثل: *_mgdl, *_g, *_cm, *_kg).

هذه الوثيقة لا تحتوي SQL؛ هي أسماء/أنواع/سلوك فقط.

1) الحسابات والأدوار
profiles
field	type	required	notes
id	uuid	✓	PK
auth_user_id	uuid	✓	فريد ويرتبط بـ Supabase Auth
full_name	text	✓	
phone	text		يُفضّل فريد عند توفره
role_hint	text		guardian | doctor | dietitian | admin (إرشادي فقط)
active_role	text		الدور النشط للواجهة: guardian | doctor | dietitian | admin
is_active	boolean	✓	افتراضي true
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
roles
field	type	required	notes
id	uuid	✓	PK
slug	text	✓	فريد: guardian | doctor | dietitian | admin
name	text	✓	اسم العرض
description	text		
is_system	boolean	✓	للأدوار الأساسية
is_active	boolean	✓	
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
user_roles
field	type	required	notes
id	uuid	✓	PK
profile_id	uuid	✓	FK → profiles.id
role_id	uuid	✓	FK → roles.id
is_primary	boolean		الدور الأساسي؟
is_active	boolean	✓	افتراضي true
assigned_by	uuid		FK → profiles.id
assigned_at	timestamptz	✓	
source	text		admin | self | system | sync
note	text		
updated_at	timestamptz	✓	
2) الأطفال والعلاقات
children
field	type	required	notes
id	uuid	✓	PK
guardian_id	uuid	✓	FK → profiles.id
full_name	text	✓	
dob	date	✓	تاريخ الميلاد
sex	text		M | F | X
diabetes_type	text		T1D | T2D | MODY | Other
diagnosis_date	date		
mrn	text		رقم ملف طبي
care_center	text		
height_cm	number		ملخّص آخر طول
weight_kg	number		ملخّص آخر وزن
bmi	number		مُشتق
metrics_measured_at	timestamptz		ملخّص وقت آخر قياس
metrics_source	text		clinic | home | device | import
allergies_summary	text		للعرض فقط
devices_summary	text		للعرض فقط
status	text	✓	active | inactive | archived
notes	text		
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
growth_metrics
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
measured_at	timestamptz	✓	وقت القياس
height_cm	number		
weight_kg	number		
bmi	number		مُشتق
waist_cm	number		اختياري
p_height	number		Percentile
p_weight	number		Percentile
p_bmi	number		Percentile
source	text		clinic | home | device | import
note	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
doctor_children
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
doctor_profile_id	uuid	✓	FK → profiles.id
status	text	✓	active | paused | ended
assigned_at	timestamptz	✓	
ended_at	timestamptz		
notes	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
dietitian_children
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
dietitian_profile_id	uuid	✓	FK → profiles.id
status	text	✓	active | paused | ended
assigned_at	timestamptz	✓	
ended_at	timestamptz		
notes	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
3) ملف السكري وخطط الأهداف
child_diabetes_profiles
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
version_no	number	✓	رقم الإصدار
status	text	✓	active | superseded | draft
effective_from	date	✓	بداية السريان
effective_to	date		نهاية السريان (اختياري)
therapy_type	text	✓	MDI | Pump
basal_insulin_name	text		للـMDI
bolus_insulin_name	text		
target_min_default	number		mg/dL
target_max_default	number		mg/dL
carb_ratio_default	number		g/U (Fallback)
corr_factor_default	number	✓	mg/dL per U
dia_hours	number		مدة تأثير الأنسولين
rounding_step_u	number		خطوة التقريب
max_bolus_u	number		
max_daily_basal_u	number		
hypo_threshold	number	✓	حد الانخفاض mg/dL
hyper_threshold	number	✓	حد الارتفاع mg/dL
hyper_critical_threshold	number	✓	حد الارتفاع الحرج mg/dL
hyper_repeat_window_min	number		نافذة التكرار (دقائق)
hyper_repeat_count	number		مرات التكرار داخل النافذة
postprandial_window_min	number		نافذة ما بعد الوجبة (دقائق)
pump_model	text		
cgm_model	text		
source	text		clinic | self | import | system
notes	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
published_at	timestamptz		
diabetes_targets
field	type	required	notes
id	uuid	✓	PK
diabetes_profile_id	uuid	✓	FK → child_diabetes_profiles.id
time_block	text	✓	breakfast | lunch | dinner | snack | overnight | school | custom
target_min	number	✓	mg/dL
target_max	number	✓	mg/dL
notes	text		
created_at	timestamptz	✓	
carb_goals_per_meal
field	type	required	notes
id	uuid	✓	PK
diabetes_profile_id	uuid	✓	FK → child_diabetes_profiles.id
meal_type	text	✓	breakfast | lunch | dinner | snack
target_carb_min_g	number	✓	غرام
target_carb_max_g	number	✓	غرام
recommended_carb_g	number		غرام
fiber_adjustment_g	number		خصم ألياف
notes	text		
created_at	timestamptz	✓	
carb_ratio_per_meal
field	type	required	notes
id	uuid	✓	PK
diabetes_profile_id	uuid	✓	FK → child_diabetes_profiles.id
meal_type	text	✓	breakfast | lunch | dinner | snack
carb_ratio_g_per_u	number	✓	g/U
active_on_days	text		weekdays | weekends
notes	text		
created_at	timestamptz	✓	
basal_profile_segments
field	type	required	notes
id	uuid	✓	PK
diabetes_profile_id	uuid	✓	FK → child_diabetes_profiles.id
start_minute_of_day	number	✓	0..1439
duration_min	number	✓	>0 وبلا تجاوز لليوم
rate_u_per_h	number	✓	وحدات/ساعة
label	text		تسمية اختيارية
day_pattern	text		all | weekdays | weekends
notes	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
mdi_basal_doses
field	type	required	notes
id	uuid	✓	PK
diabetes_profile_id	uuid	✓	FK → child_diabetes_profiles.id
dose_time_minute_of_day	number	✓	0..1439
units	number	✓	>0
insulin_name	text		تجاوز للاسم الافتراضي
day_pattern	text		all | weekdays | weekends
notes	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
4) القياسات والإنسولين والكيتو
glucose_readings
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
taken_at	timestamptz	✓	وقت القياس
source	text	✓	cgm | fingerstick | manual | import
value_mgdl	number	✓	>0
trend	number		ميل/اتجاه
context	text		fasting | premeal | postmeal | exercise | bedtime | overnight | sickday | other
tag	text		
related_meal_id	uuid		FK → meals.id
gly_zone	text		low | in_range | high | critical_high (مُشتق)
is_repeat_critical	boolean		مُشتق نافذة التكرار
classed_at	timestamptz		وقت التصنيف
note	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
insulin_doses
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
given_at	timestamptz	✓	وقت الجرعة
dose_type	text	✓	basal | bolus | correction
insulin_name	text	✓	
units	number	✓	>0
delivered_by	text		pen | syringe | pump | other
related_meal_id	uuid		FK → meals.id
pre_glucose_mgdl	number		
target_mgdl	number		
carb_grams	number		
carb_ratio_used	number		g/U
corr_factor_used	number		mg/dL per U
calc_carb_units	number		
calc_corr_units	number		
override_reason	text		سبب التعديل
notes	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
keto_readings (اختياري)
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
taken_at	timestamptz	✓	
type	text	✓	blood | urine
value	text/number	✓	قيمة القياس
unit	text	✓	mmol_per_L | strip_scale
class	text		normal | elevated | high (مُشتق)
note	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
5) التغذية
food_categories
field	type	required	notes
id	uuid	✓	PK
slug	text	✓	فريد
name	text	✓	
description	text		
is_active	boolean	✓	
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
food_items
field	type	required	notes
id	uuid	✓	PK
name	text	✓	اسم الصنف
category_id	uuid	✓	FK → food_categories.id
brand	text		
is_branded	boolean		افتراضي false
lang	text		ar | en …
barcode_gtin	text		
serving_size	number		حجم الحصة الافتراضي
serving_unit	text		g | ml | piece
carbs_per_100	number	✓	
protein_per_100	number	✓	
fat_per_100	number	✓	
kcal_per_100	number	✓	
fiber_per_100	number		
sugars_per_100	number		
sodium_mg_per_100	number		
is_active	boolean	✓	
source	text		nutritionist | import | user | usda | other
notes	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
food_portions
field	type	required	notes
id	uuid	✓	PK
food_item_id	uuid	✓	FK → food_items.id
measure	text	✓	اسم المكيال (كوب/قطعة…)
quantity	number	✓	>0
grams	number	✓	مكافئ بالجرام/مل
notes	text		
created_at	timestamptz	✓	
6) الوجبات
meals
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
meal_time	timestamptz	✓	وقت الوجبة
meal_type	text	✓	breakfast | lunch | dinner | snack
total_carbs_g	number		مُجمّع من البنود
total_kcal	number		
post_window_min	number		تجاوز للنافذة من الخطة
linked_bolus_id	uuid		FK → insulin_doses.id
notes	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
meal_items
field	type	required	notes
id	uuid	✓	PK
meal_id	uuid	✓	FK → meals.id
food_item_id	uuid	✓	FK → food_items.id
quantity	number	✓	>0
serving_unit	text		عند اختلاف الوحدة
carbs_g	number	✓	
kcal	number		
fiber_g	number		
net_carbs_g	number		صافي الكارب (اختياري)
note	text		
7) خطط التغذية
diet_plans
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
version_no	number	✓	
status	text	✓	draft | active | superseded
effective_from	date	✓	
effective_to	date		
daily_kcal_target	number		
daily_carb_target_g	number		
protein_target_g	number		
fat_target_g	number		
notes	text		
created_by	uuid		FK → profiles.id
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
published_at	timestamptz		
diet_plan_meals
field	type	required	notes
id	uuid	✓	PK
diet_plan_id	uuid	✓	FK → diet_plans.id
meal_type	text	✓	breakfast | lunch | dinner | snack
target_carb_min_g	number	✓	
target_carb_max_g	number	✓	
recommended_carb_g	number		
allowed_categories	text		فئات مسموحة
prohibited_items	text		أصناف محظورة
notes	text		
8) الزيارات والتوصيات
visits
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
provider_profile_id	uuid	✓	FK → profiles.id
provider_role	text	✓	doctor | dietitian
scheduled_at	timestamptz	✓	
duration_min	number		
status	text	✓	scheduled | completed | cancelled | no_show
visit_type	text		followup | adjustment | education | other
summary	text		
notes	text		
created_at	timestamptz	✓	
updated_at	timestamptz	✓	
visit_recommendations
field	type	required	notes
id	uuid	✓	PK
visit_id	uuid	✓	FK → visits.id
title	text	✓	
details	text	✓	خطة/تعليمات
valid_from	date	✓	
valid_to	date		NULL = مفتوحة
priority	text		low | normal | high
created_at	timestamptz	✓	
9) الأجهزة والملفات
device_catalog
field	type	required	notes
id	uuid	✓	PK
brand	text	✓	
model	text	✓	
type	text	✓	pump | cgm | pen | meter | other
notes	text		
is_active	boolean	✓	
created_at	timestamptz	✓	
child_devices
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
device_id	uuid	✓	FK → device_catalog.id
serial_no	text		
assigned_from	date	✓	بداية الربط
assigned_to	date		نهاية الربط
status	text	✓	active | retired | lost
notes	text		
created_at	timestamptz	✓	
attachments
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
visit_id	uuid		FK → visits.id
path	text	✓	مسار الملف (Storage)
file_name	text	✓	
mime_type	text	✓	
uploaded_by	uuid	✓	FK → profiles.id
uploaded_at	timestamptz	✓	
note	text		
sha256	text		اختياري: بصمة لتفادي التكرار
10) الإشعارات والتدقيق والتحليلات
notifications
field	type	required	notes
id	uuid	✓	PK
recipient_profile_id	uuid	✓	FK → profiles.id
child_id	uuid		FK → children.id
type	text	✓	critical_repeat | visit_update | comment | system
payload	text		بيانات إضافية
is_read	boolean	✓	
created_at	timestamptz	✓	
audit_logs
field	type	required	notes
id	uuid	✓	PK
actor_profile_id	uuid	✓	FK → profiles.id
action	text	✓	نوع الحدث
entity	text	✓	اسم الكيان
entity_id	uuid	✓	معرف الكيان
metadata	text		تفاصيل إضافية
created_at	timestamptz	✓	
analytics_daily
field	type	required	notes
id	uuid	✓	PK
child_id	uuid	✓	FK → children.id
day	date	✓	تاريخ اليوم
avg_glucose	number		
tir_pct	number		نسبة الوقت ضمن النطاق
hypos_count	number		
hypers_count	number		من critical_high
repeat_critical_events	number		
carbs_total_g	number		
insulin_total_u	number		
meals_count	number		
11) التخزين (Storage Buckets)

food-items: صور الأصناف — كتابة: المالك فقط، قراءة: عامة/مقيّدة حسب الحاجة.

attachments: مرفقات الزيارات/الطفل — سياسات حسب الدور والملكية.

لا تُستخدم مفاتيح خدمة على العميل.

12) العلاقات (ERD نصّي مختصر)

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

13) فهارس مقترحة (مختصرة)

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

14) ملاحظات RLS (نص فقط، بدون SQL)

guardian: CRUD لأطفاله وما يتبعهم (meals/meal_items)، قراءة visits وattachments الخاصة بأطفاله وفق السياسة.

doctor: قراءة أطفال مربوطين عبر doctor_children + CRUD على visits وdoctor_notes/الملخص.

dietitian: قراءة أطفال مربوطين + CRUD على diet_plans وdiet_plan_meals، وقراءة meals/meal_items/glucose_readings.

admin: كامل الصلاحيات + إدارة القواميس والربط والأدوار.

التخزين: كتابة لصاحب السجل فقط، وقراءة حسب الدور/الملكية.

15) اقتراحات CHECK/Enums (اختيارية للتوثيق)

meals.meal_type ∈ (breakfast,lunch,dinner,snack)

insulin_doses.dose_type ∈ (basal,bolus,correction)

visits.provider_role ∈ (doctor,dietitian)

children.status ∈ (active,inactive,archived)

استخدمي timestamptz لجميع أوقات التسجيل والقياس.

انتهى — أي تعديل هيكلي لاحق يتم عبر تذكرة منفصلة ثم تحديث هذا المستند.
[[END]]
