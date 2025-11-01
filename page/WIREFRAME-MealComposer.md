# WIREFRAME — Meal Composer (صفحة إنشاء/تحرير الوجبة)

> **الغرض:** تحديد تخطيط وتجربة الاستخدام لصفحة تكوين الوجبة للطفل، بدون كود، مع ربط كل جزء ببيانات القاعدة وـRPCs.  
> **آخر تحديث:** 2025-11-01 (Asia/Kuwait)

---

## 1) نظرة عامة (Overview)
- **المستخدم:** وليّ الأمر (V1)، الطبيب للقراءة فقط.  
- **المخرَج النهائي:** سجل في `meals` + عناصر في `meal_items` + (اختياري) جرعة في `boluses`، مع ربط تلقائي بقياسات pre/post.  
- **مؤشرات الأمان:** تحذير الحساسية (block/warn)، منطق التصحيح يبدأ من `targets.severe_high`، عرض سياسة Net/Total بوضوح.

---

## 2) تخطيط الشاشة (Layout)
تخطيط عمودي (Mobile-first)، شبكة عمودين على الشاشات الواسعة.

```
[Header]
  ├─ Child Switcher + Date/Time + Meal Type
  └─ Info badges: policy (net/total) • allergy policy • units

[Card A] Pre‑Meal BG
  ├─ Auto-pick (RPC) + Manual entry
  └─ Zone chip (Low/IR/High/Severe)

[Card B] Food Picker
  ├─ Search + Filters (category, diet tags, allergens hide)
  ├─ Item list (card): name, tags, measures dropdown, qty
  └─ Allergy badges + warn/block behavior

[Card C] Summary & Policy
  ├─ Totals: Total/Fiber/Net • kcal
  ├─ Switch: Total vs Net (if allowed)
  └─ Goal bar: per‑meal target + delta

[Card D] Dose (Optional V1 = read-only suggest)
  ├─ Carb dose (ICR) + Correction (ISF) = Total
  └─ Rounding/limits notes

[Footer Actions]
  ├─ Save Meal
  ├─ Save & Add Dose (V1.1)
  └─ Cancel
```

---

## 3) مكوّنات أساسية (Components)

### 3.1 Header
- **Child Picker**: قائمة أطفال المستخدم (profile)؛ اختيار يُحمّل خطط الطفل.  
- **Date/Time** (افتراضي الآن؛ يسمح بوضع **إدخال متأخر**).  
- **Meal Type**: `breakfast | lunch | dinner | snack`.  
- **Badges**:  
  - `Fiber Policy`: من `child_diet_profile.fiber_policy` أو `user_settings.fiber_policy_default`.  
  - `Allergy Enforcement`: `block|warn`.  
  - `Units`: mg/dL + g.

### 3.2 Card A — Pre‑Meal BG
- زر **التقاط تلقائي**: يستدعي `rpc_pick_pre_meal_bg(child_id, meal_type, meal_datetime)`، ويعرض القراءة إن وُجدت.  
- حقل إدخال يدوي مع وحدة mg/dL.  
- **Zone Chip** (حسب `targets` الفعّالة):  
  - Low / In‑Range / High / Severe High.  
- تنبيه: لو عدم وجود pre BG عند محاولة حساب التصحيح، نعرض إشعار “أدخل القياس أولًا”.

### 3.3 Card B — Food Picker
- **بحث** بالاسم AR/EN + مرشحات: category، `diet_tags_auto`، إخفاء أصناف الحساسية (`hide_conflicting_foods`).  
- **بطاقة صنف**: اسم، صورة رمزية (اختياري)، وسوم (`HIGH_FIBER`, `LOW_SODIUM`, `HALAL` …).  
- **Measures**: Dropdown من `food_measures` (label + weight/volume).  
- **Qty**: رقم عشري (مثلاً 1.5 كوب).  
- زر **+ إضافة** → ينتقل إلى **قائمة العناصر أسفل الكارد**:
  - سطر لكل عنصر مضاف: اسم snapshot، المقياس/الجرام، الكارب/الألياف/Net، زر حذف/تعديل.  
  - **تحذير حساسية**:  
    - `block`: يمنع الإضافة مع رسالة واضحة.  
    - `warn`: يسمح مع شارة `⚠️` و`allergy_conflict=true` في العنصر.

### 3.4 Card C — Summary & Policy
- **Totals live**:  
  - `Total Carbs`, `Fiber`, **`Net Carbs`** (+ kcal) يتم تحديثها فورًا.  
- **Switch**: Total ↔ Net (لو سياسة المستخدم تسمح)، ويؤثر على الحساب.  
- **Goal Bar**: هدف الوجبة من `child_carb_goals.per_meal[meal_type]`، شريط تقدّم + `delta_from_goal_g`، وبادج “داخل الهدف” عند الاستيفاء.

### 3.5 Card D — Dose (اقتراح/قراءة فقط في V1)
- عرض **Carb Dose** باستخدام ICR المناسب (من `insulin_plan` أو `icr_schedule`).  
- لو pre‑BG متوفر و≥ severe_high: عرض **Correction** وفق `insulin_plan` (ISF/Target)، مع الملاحظات (التقريب/الحدود).  
- تنبيه: “القرار النهائي لوليّ الأمر/الطبيب — هذا حساب إرشادي.”

### 3.6 Actions
- **Save Meal**: يحفظ `meals` + `meal_items`، ويملأ `calc_snapshot`، ثم يستدعي `rpc_link_measurements_to_meal(meal_id)`.  
- **Save & Add Dose** (V1.1): يفتح Modal لتسجيل جرعة في `boluses` باستخدام القيم المقترحة.  
- **Cancel**: إغلاق بدون حفظ.

---

## 4) حالات (States)

- **Late Entry Mode**: عند تغيير التاريخ/الوقت لوقت سابق؛ تظهر شارة “إدخال متأخر”، وتسمح بإرفاق pre‑BG الأقرب في الماضي.  
- **No Pre BG**: إخفاء التصحيح وإظهار تنبيه لطيف.  
- **Allergy Block**: منع إضافة الصنف + رسالة توضيح ومفتاح “إدارة الحساسيّات”.  
- **Allergy Warn**: السماح مع شارة تحذير، ويُخزَّن `allergens_snapshot` و`allergy_conflict=true`.  
- **Exceeded Max Dose** (من `insulin_plan.max_total_meal_units`): شارة حمراء مع نص تفسير.  
- **Invalid Measure**: لو مقياس بلا `grams/ml` → يمنع الإضافة.  
- **Empty Basket**: زر الحفظ معطّل حتى وجود عنصر واحد.

---

## 5) تدفّق البيانات (Data Flow)

### حفظ الوجبة
1) جمع عناصر السلة (food_id, measure_id, qty → **grams**).  
2) حساب per item: `carbs_total`, `fiber_total`, (kcal).  
3) حساب Summary: `total_carbs`, `total_fiber`, `net_carbs`.  
4) بناء `calc_snapshot` (policy/units/ICR/ISF المستخدمة).  
5) استدعاء `rpc_upsert_meal_with_items(payload)` → يرجع `meal_id`.  
6) استدعاء `rpc_link_measurements_to_meal(meal_id)` لربط pre/post.  
7) عرض Toast “تم الحفظ” + Badge “ضمن الهدف” لو مستوفى.

### حساب التصحيح (قراءة فقط V1):
- `rpc_calculate_correction_dose(child_id, glucose_mgdl, observed_at)` يعيد JSON (raw/rounded/limits/zone).

---

## 6) التحقق (Validation)
- **حقول إلزامية:** الطفل، النوع، التاريخ/الوقت، عنصر واحد على الأقل.  
- **المقاييس:** يجب أن يمتلك المقياس وزنًا (grams أو ml + كثافة).  
- **الحساسية:** تطبيق `block|warn` وفق `child_diet_profile`.  
- **الجرعات:** عدم العرض دون pre‑BG أو دون شروط الارتفاع الشديد.

---

## 7) قابلية الوصول (A11y)
- أزرار كبيرة، تسميات واضحة، تباين كافٍ.  
- دعم لوحة المفاتيح في البحث والاختيار.  
- رسائل خطأ قابلة للقراءة VoiceOver/AR.

---

## 8) تتبّع وتحليلات (Telemetry) — اختيارية
- زمن تكوين وجبة، عدد العناصر، استخدام زر auto‑pick BG، حالات allergy block/warn، معدل تكرار late entry.

---

## 9) خرائط البيانات (Mapping مختصر)

| UI | جدول/حقل |
|---|---|
| Child/Date/MealType | `meals.child_id`, `meals.datetime`, `meals.meal_type` |
| Cart Items | `meal_items` (snapshots per item) |
| Summary Totals | `meals.total_carbs/fiber/net_carbs` |
| Policy | `meals.fiber_policy` + snapshot |
| Pre‑BG | `measurements` (linked via `rpc_link_measurements_to_meal`) |
| Dose (view) | `insulin_plan` + `targets` |
| Goal Bar | `child_carb_goals` + snapshot في `meals.calc_snapshot` |

---

## 10) معايير القبول (Acceptance)
- إضافة/تعديل/حذف عنصر يحدّث المجموعات لحظيًا.  
- Allergy block/warn يعمل حسب سياسة الطفل.  
- التحويل بين Net/Total يؤثر على Summary والـ Goal Bar.  
- الحفظ ينتج `meals` + `meal_items` + ربط pre/post (إن توفّر).  
- عرض جرعة الكارب والتصحيح بصورة **قراءة فقط** في V1.

---

## 11) لاحقًا (V1.1–V2)
- تسجيل جرعة مباشرة (Save & Add Dose) + IOB.  
- استيراد صور الوجبة (attachments).  
- اقتراحات ذكية بناءً على الاستخدام السابق/الوقت من اليوم.  
- قالب “وجبة محفوظة” (favorite combos).

