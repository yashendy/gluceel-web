# ARCHITECTURE — مرجعية بنية منصة Gluceel

> **الغرض:** توثيق هيكل البيانات والعلاقات وقواعد الأمان والمنطق المركزي (RPC/Triggers) كمرجع موحّد للفريق.  
> **آخر تحديث:** 2025-11-01 (Asia/Kuwait)  
> **ملاحظة:** تفاصيل نظام المكافآت موثّقة في ملف مستقل: **REWARDS.md**.

---

## 0) مبادئ عامة
- **الوحدات القياسية:** السكر mg/dL، الوزن كجم، الطول سم، التغذية لكل 100 جم.  
- **التوقيت:** نستخدم التوقيت المحلي من `user_settings.timezone`؛ العرض الافتراضي Asia/Kuwait.  
- **اللقطات (Snapshots):** نحفظ القيم المستخدمة وقت التنفيذ (مثلاً قيم التغذية/الحدود) لضمان تفسير النتائج تاريخيًا.  
- **السلامة:** بداية التصحيح من `targets.severe_high`. لا نعتمد أي حساب جرعات خارج قواعد `insulin_plan`.  
- **الخصوصية:** ملفات المرفقات في Bucket خاص وتُعرض عبر Signed URLs فقط.

---

## 1) الجداول الأساسية (Purpose + لمحة سريعة)

### A) الهوية والصلاحيات
- **profiles**: ملف المستخدم (وصي/طبيب/أدمن).  
- **children**: ملف كل طفل.  
- **child_guardians**: ربط وصي ↔ طفل (+ `relation`, `is_primary`, `can_edit`).  
- **share_access**: منح طبيب وصولًا لطفل معيّن (`scopes: read|comment`, `expires_at`).

### B) القياسات
- **measurements**: قراءة سكر واحدة: `observed_at`, `glucose_mgdl`, `context_timing (pre/post/...)`, `context_meal_type`, `series_id/seq`, `anchor_meal_id`, `time_accuracy`.

### C) الوجبات والتغذية
- **meals**: وجبة الطفل: `datetime`, `meal_type`, إجماليات `total_carbs`, `total_fiber`, `net_carbs`, `fiber_policy`, `calc_snapshot`.  
- **meal_items**: عناصر الوجبة + لقطات التغذية (`carbs_per_100g`, `fiber_per_100g`) ونتائجها (`carbs_total`, `fiber_total`) وتحذير الحساسية.  
- **food_items (V3)**: قاموس الأصناف (AR/EN + per100: carbs/fiber/sugars/added_sugars/starch/polyols/protein/fat/sat/trans/sodium/kcal/gi + `density_g_per_ml` للسائل + `diet_tags_auto`).  
- **food_measures**: وحدات منزلية للصنف (`label`, `grams` أو `ml`, `is_default`, `accuracy`).

### D) الخطط والأهداف
- **targets**: مناطق الهدف للطفل (critical/severe/low/in-range/high/severe_high/critical_high).  
- **insulin_plan** (تاريخي): ICR (`carb_ratio_g_per_unit` أو `icr_schedule`), ISF/Target, حدود التقريب والحدود القصوى/الدنيا (+ إعدادات IOB الاختيارية).  
- **child_carb_goals** (تاريخي): `evaluation_basis (net|total)`, `daily_goal_g`, `per_meal`, `weekday_overrides`, `tolerance`.

### E) الحساسيّات والتفضيلات
- **allergens**: قاموس مثيرات الحساسية.  
- **food_allergen_map**: ربط صنف ↔ مُثير (contains|may_contain|free_from|unknown).  
- **child_allergies**: حساسيّات الطفل (`severity`, `status`, `source`).  
- **child_food_prefs** (اختياري): تفضيلات/قيود غير طبية (حلال/كره طعم/…).
  
### F) الجرعات
- **boluses**: الجرعات الفعلية (`type`, `started_at`, `units_total`, تفكيك meal/correction, ربط meal/measurement, `calc_snapshot`).

### G) النمو والتحاليل
- **child_growth**: طول/وزن + BMI + (اختياري) Z/P (WHO/CDC).  
- **labs**: تقرير مختبر (collected_at, reported_at, status, fasting, sample_type, report_file).  
- **lab_items**: عناصر التحليل (analyte_code, value, unit, ref_range snapshot, flags, مشتقات مثل eAG).  
- **lab_test_catalog** (اختياري): قاموس التحاليل والـ panels.

### H) المرفقات
- **attachments**: بيانات ملف مرتبط (طفل/وجبة/تحليل/قياس/ملاحظة) + path/mime/size/taken_at/tags (Bucket خاص).

### I) الزيارات والملاحظات
- **visits**: مواعيد المتابعة وسياقها (`visit_type`, `status`, `scheduled/started/ended`, `previsit_summary`).  
- **doctor_notes**: ملاحظات الطبيب (SOAP) + `plan_changes` + سياسات المشاركة.  
- **care_tasks** (اختياري): مهام متابعة منزلية مع `points_reward`.

### J) المكافآت (انظري REWARDS.md للتفاصيل)
- **rewards_points_ledger**: دفتر عمليات النقاط (مصدر الحقيقة).  
- **rewards_daily_scores**: ملخّص اليوم (كاش) + `awards_snapshot`.  
- **rewards_achievements_catalog**: كتالوج إنجازات.  
- **rewards_child_achievements**: إنجازات مُكتسبة.  
- **rewards_streaks / rewards_catalog / rewards_redemptions** (اختياري للمتجر).

### K) الإعدادات والسياسات
- **user_settings**: لغة/منطقة زمنية/وحدات، أوقات الوجبات الافتراضية، نوافذ pre/post، سياسة الألياف، تنبيهات…  
- **child_diet_profile**: سياسات غذائية للطفل + `allergy_enforcement (block|warn)` + سياسة الألياف الخاصة به.  
- **child_settings** (اختياري): قواعد دقيقة لإدخال القياس والربط.  
- **notifications** (اختياري): إخطارات مرسلة/مقروءة.  
- **consents** (اختياري): موافقات الخصوصية/المشاركة.

---

## 2) العلاقات (ER مختصر بنص ASCII)

```
profiles ──< child_guardians >── children ──< measurements
     │                         └──< meals ──< meal_items >── food_items ──< food_measures
     └──< share_access >───────┘
children ──< targets
children ──< insulin_plan
children ──< child_carb_goals
children ──< child_allergies >── allergens ──< food_allergen_map >── food_items
children ──< boluses ──( meal_id?, measurement_id? )
children ──< child_growth
children ──< labs ──< lab_items
children ──< attachments ─( meal_id?, lab_id?, measurement_id?, note_id? )
children ──< visits ──< doctor_notes
children ──< rewards_points_ledger
children ──< rewards_daily_scores
children ──< rewards_child_achievements
profiles ──1:1─ user_settings
children ──1:1─ child_diet_profile
children ──1:1─ child_settings
```

**الأنماط:** 1:N (`──<`) ، N:M عبر جداول الربط (`>──<`).

---

## 3) سياسات الأمان (RLS) — ملخّص

| المجموعة | Select | Insert/Update/Delete |
|---|---|---|
| **children / measurements / meals(+items) / boluses / labs(+items) / child_growth / attachments / visits / doctor_notes / care_tasks** | أي مستخدم يمر عبر `can_access_child(child_id)` (وصي/طبيب مصرح/أدمن) | الوصي أو الأدمن فقط. الطبيب **قراءة**؛ ويستطيع إضافة/تعديل **doctor_notes** لو `scope=comment`. |
| **targets / insulin_plan / child_carb_goals** | `can_access_child` | الوصي/الأدمن فقط (الطبيب قراءة). |
| **food_items / food_measures / allergens / food_allergen_map** | قراءة مفتوحة | كتابة/تعديل: **أدمن فقط**. |
| **rewards\*** | `can_access_child` | الإدراج عبر النظام/الوصي/الأدمن؛ لا تعديل بعد الإدراج (أو نافذة قصيرة)، حذف للأدمن. |
| **user_settings / child_diet_profile / child_settings** | المالك/من له حق على الطفل | المالك/الوصي/الأدمن. |

> يُفترض وجود دوال: `is_admin()`, `is_guardian_of(uid, child_id)`, `is_doctor_for(uid, child_id)`, `can_access_child(uid, child_id)`.

---

## 4) دوال القاعدة (RPCs) — مصدر منطق موحّد
- `rpc_calculate_correction_dose(child_id, glucose_mgdl, observed_at)` → JSON (zone, raw/rounded, limits, reasons).  
- `rpc_pick_pre_meal_bg(child_id, meal_type, meal_datetime)` → أفضل قراءة pre في نافذة `pre_window_mins`.  
- `rpc_upsert_meal_with_items(payload)` → إنشاء/تحديث وجبة + عناصرها + حساب الإجماليات + فحص الحساسية.  
- `rpc_link_measurements_to_meal(meal_id)` → ربط قياسات pre/post بالوجبة.  
- *(اختياري)* `rpc_get_parent_dashboard_kpis(child_id, from, to)` → ملخّص KPIs للوحة وليّ الأمر.  
- *(Rewards)* `rpc_award_daily_points(child_id, day)` → يمنح النقاط اليومية Idempotent ويحدّث `rewards_daily_scores`.

---

## 5) التريجرز (Triggers)
- **meal_items** ⇒ تحديث `meals.total_carbs/total_fiber/net_carbs` وملء `calc_snapshot` عند الحاجة.  
- **measurements** (عند insert): محاولة تعيين `context_timing/context_meal_type` وتعبئة `series_id/seq` وربط `anchor_meal_id` إن أمكن.  
- **meal_items (حساسية)**: منع الحفظ عند تعارض `block` أو وضع `allergy_conflict=true` عند `warn`.

---

## 6) الفهارس (Indexing) — توصيات
- زمنية: `(child_id, observed_at DESC)` في measurements، `(child_id, datetime DESC)` في meals، `(child_id, started_at DESC)` في boluses.  
- تغذية: فهارس على `food_items(name_ar, name_en, category, is_active)`.  
- ربط: `(meal_id, order_index)` في meal_items، `(lab_id)` في lab_items.  
- مكافآت: Unique جزئية تمنع منح نفس السبب مرتين في اليوم.

---

## 7) بيانات تمهيدية (Seed) للاختبار
- طفل تجريبي + وصي.  
- `targets` افتراضية + `insulin_plan` (ICR/ISF/Target).  
- 3 أصناف: توست/لبن/تفاح + مقاييسهم.  
- قياسان (pre/post) + وجبة مبدئية.  
- `allergens` (milk/peanut/…)، ووسم اللبن بـ milk؛ وإضافة حساسية milk للطفل لتجربة التحذير.  
- `labs` (HbA1c 7.2%) لتحويل eAG.  
- `rewards` عيّنة يومية لتجربة الصفحة.

---

## 8) ربط الجداول بالصفحات (Mapping)
- **Dashboard وليّ الأمر:** measurements, meals(+items), labs(+items), targets, child_carb_goals, child_growth, rewards.  
- **Dashboard الطبيب:** measurements, meals, boluses, labs, child_growth, insulin_plan, targets, doctor_notes.  
- **Meal Composer:** meals, meal_items, food_items, food_measures, measurements, insulin_plan, targets, child_carb_goals, allergies.  
- **القياسات (اليوم الذكي):** measurements (+ series), user_settings (slots).  
- **التحاليل:** labs, lab_items, attachments.  
- **النمو:** child_growth.  
- **الزيارات/الملاحظات:** visits, doctor_notes, attachments.  
- **المرفقات:** attachments.  
- **الإعدادات:** user_settings, child_diet_profile, child_settings.  
- **المكافآت:** rewards_* (انظري REWARDS.md).

---

## 9) مراجع
- **REWARDS.md** — مصفوفة النقاط والـ reason_code، القواعد وسلوك الصفحة.
