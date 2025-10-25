[[BEGIN]]

Child — Context (v1)
الغرض والدور

واجهة مركزية لملف الطفل، مقسّمة تبويبات: نظرة عامة، قياسات، وجبات، زيارات، خطط، ملفات، مع اختلاف الصلاحيات حسب الدور.

المسارات المغطّاة

/child/:childId/overview

/child/:childId/readings

/child/:childId/meals, /child/:childId/meals/new, /child/:childId/meals/:mealId

/child/:childId/visits, /child/:childId/visits/new, /child/:childId/visits/:visitId

/child/:childId/plans

/child/:childId/files, /child/:childId/files/:fileId

الجداول والحقول المستخدمة (قراءة/كتابة)

children (الأساس + الملخصات)

growth_metrics: measured_at, height_cm, weight_kg, bmi, source, note

glucose_readings: taken_at, source, value_mgdl, context, related_meal_id, gly_zone, note

insulin_doses: given_at, dose_type, insulin_name, units, related_meal_id, notes

meals / meal_items: meal_time, meal_type, totals… + بنود الوجبة

visits / visit_recommendations

diet_plans / diet_plan_meals

attachments (+ مسار Storage)

(اختياري عرض) child_devices / device_catalog

عناصر الواجهة المنطقية (IDs/Sections)

تبويبات: #tab-overview, #tab-readings, #tab-meals, #tab-visits, #tab-plans, #tab-files

داخل الوجبات: #mealBuilder, #foodPicker

داخل القياسات: #readingsChart, #addReadingBtn

داخل الزيارات: #visitList, #newVisitBtn, #visitForm

داخل الخطط: #planList, #planForm

داخل الملفات: #attachmentsTable, #uploadAttachmentBtn

الحالات والتحقق

معرف الطفل صالح وله علاقة بالمستخدم الحالي حسب الدور/الربط.

ضبط التواريخ/الأوقات timestamptz.

احترام حدود الإدخال (قيم موجبة، نطاقات منطقية…).

الأفعال والتداعيات

تحميل تبويب تبعًا للدور (إخفاء/إظهار قدرات CRUD).

أفعال CRUD على تبويبات الوجبات/الزيارات/الخطط/الملفات حسب الصلاحية.

تحديث الملخصات في الواجهة (وليس تخزينًا) عند تغيّر البيانات.

الصلاحيات

guardian: CRUD للوجبات والملفات، قراءة القياسات/الزيارات/الخطط.

doctor: CRUD للزيارات والتوصيات، قراءة الباقي.

dietitian: CRUD للخطط، قراءة الوجبات/القياسات/الزيارات/الملفات.

admin: كامل.

خطوات الاختبار اليدوي

فتح /child/:childId/overview بدور guardian مرتبط → ترى كل التبويبات مع قدرات CRUD الخاصة بك.

بدّل الدور إلى doctor → يظهر CRUD للزيارات، وتبقى الوجبات قراءة فقط.

أضف وجبة جديدة → تُعرض في قائمة الوجبات ويُحدّث الإجمالي.

أنشئ زيارة وأضف توصية → تظهر في تبويب الزيارات.

ارفع ملفًا (attachment) → يظهر في تبويب الملفات مع بيانات الرفع.

أسئلة مفتوحة

هل نعرض “تحليلات” مستقلة للطفل أم نكتفي بالـoverview؟

سياسة حذف الملفات: من Storage فقط أم مع سجل قاعدة البيانات؟
[[END]]
