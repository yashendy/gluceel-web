[[BEGIN]]

Visits — Context (v1)
الغرض والدور

جدولة وتوثيق زيارات الطبيب/أخصائي التغذية، مع ملخص الزيارة وتوصيات تابعة وربط مرفقات.

المسارات المغطّاة

/child/:childId/visits

/child/:childId/visits/new

/child/:childId/visits/:visitId

الجداول والحقول المستخدمة (قراءة/كتابة)

visits: id, child_id, provider_profile_id, provider_role, scheduled_at, duration_min, status, visit_type, summary, notes

visit_recommendations: id, visit_id, title, details, valid_from, valid_to, priority

(اختياري) attachments: child_id, visit_id, path, file_name, mime_type, uploaded_by, uploaded_at

عناصر الواجهة المنطقية (IDs/Sections)

#visitsTable, #newVisitBtn

#visitForm (الأساس + provider_role)

#recommendationsSection (إضافة/تحرير التوصيات)

#visitAttachments (رفع/عرض ملفات)

الحالات والتحقق

provider_role يطابق دور المستخدم الحالي (doctor/dietitian) ومربوط بالطفل.

status ينتقل منطقيًا (scheduled → completed/cancelled/no_show).

valid_from ≤ valid_to (إن وُجدت).

الأفعال والتداعيات

إنشاء/تعديل/إلغاء زيارة.

إضافة توصية صالحة المدة.

ربط/إزالة مرفقات مرتبطة بالزيارة.

الصلاحيات

doctor/dietitian: CRUD على زيارات الأطفال المرتبطين بهم.

guardian: قراءة زيارات طفله.

admin: كامل.

خطوات الاختبار اليدوي

إنشاء زيارة بدور doctor لطفل مرتبط → تظهر في الجدول.

إضافة توصية بمدة صلاحية → تظهر تحت الزيارة.

تغيير الحالة إلى completed → تُقفل حقول زمنية.

محاولة تعديل زيارة لطبيب غير مرتبط → مرفوض.

رفع مرفق وربطه بالزيارة → يظهر في قسم المرفقات.

أسئلة مفتوحة

هل نحتاج أنواع زيارات إضافية؟

هل نحتاج إشعارات تلقائية قبل/بعد موعد الزيارة؟
[[END]]
