[[BEGIN]]

Auth — Context (v1)
الغرض والدور

تسجيل الدخول عبر Supabase (Google)، إنشاء/مزامنة ملف المستخدم (profiles)، تعيين/قراءة الأدوار، تحديد الدور النشط (active_role) للتوجيه وحراسة المسارات.

المسارات المغطّاة

/auth (صفحة الدخول)

/auth/callback (إتمام OAuth)

إعادة التوجيه بعد الدخول: /dashboard أو حسب الدور النشط

الجداول والحقول المستخدمة (قراءة/كتابة)

profiles: id, auth_user_id, full_name, phone, role_hint, active_role, is_active, created_at, updated_at

roles: id, slug, name, is_active

user_roles: id, profile_id, role_id, is_primary, is_active, assigned_at, source

(اختياري) audit_logs: actor_profile_id, action, entity, entity_id, metadata

عناصر الواجهة المنطقية (IDs/Sections)

#googleSignInBtn, #signOutBtn

#profileInfo (عرض الاسم والبريد والدور النشط)

#roleSwitcher (قائمة للأدوار المتاحة للمستخدم)

#statusAlert (تنبيهات أخطاء/نجاح)

الحالات والتحقق (Validation)

نجاح/فشل OAuth، صلاحية redirect URL.

عند أول دخول: إنشاء صف في profiles إن لم يوجد، وتوليد user_roles الافتراضي (guardian كافتراضي لو لا يوجد).

تفعيل/تعليق الحساب: profiles.is_active.

تبديل الدور: يجب أن يطابق دورًا مُسنَدًا في user_roles.is_active=true.

الأفعال والتداعيات (Actions & Side Effects)

Sign-In: يبدأ OAuth → بعد العودة: مزامنة profiles/user_roles → اختيار/تحديد active_role → redirect.

تبديل الدور: تحديث profiles.active_role (سيرفر) + إعادة توجيه للمسار المناسب.

Sign-Out: إنهاء الجلسة والتنظيف المحلي.

تسجيل تدقيق (اختياري): audit_logs على أحداث sign-in/role-switch.

الصلاحيات

صفحة /auth عامة.

كتابة active_role وإدارة user_roles عبر سيرفر فقط (ليست على العميل).

باقي الصفحات تعتمد على active_role + RLS.

خطوات الاختبار اليدوي

دخول Google ناجح → إنشاء profiles + تعيين active_role الافتراضي → انتقال إلى /dashboard.

مستخدم يملك أكثر من دور → تبديل عبر #roleSwitcher → يتحدث active_role ويرتفع الحارس للمسارات.

مستخدم موقوف is_active=false → يمنع الدخول/يعرض رسالة مناسبة.

فشل OAuth/redirect غير مسموح → رسالة عربية واضحة.

خروج ناجح يعيدك إلى /auth.

أسئلة مفتوحة

هل نقيّد الدخول على نطاق بريد معيّن؟

هل نرسل إشعارًا للأدمن عند أول تسجيل؟

ترتيب الأدوار الافتراضي عند غياب أي دور (guardian فقط؟)
[[END]]

ملف: docs/contexts/children.md
[[BEGIN]]

Children — Context (v1)
الغرض والدور

إدارة قائمة الأطفال لوليّ الأمر (CRUD)، عرض للطاقم الطبي/التغذوي (قراءة)، واختصارات إلى ملف الطفل.

المسارات المغطّاة

/children (قائمة الأطفال)

اختصار إلى: /child/:childId/*

الجداول والحقول المستخدمة (قراءة/كتابة)

children: id, guardian_id, full_name, dob, sex, diabetes_type, diagnosis_date, status, notes

children (ملخصات): height_cm, weight_kg, bmi, metrics_measured_at, metrics_source (قيم مُلخّصة)

(قراءة فقط) growth_metrics: آخر قياس لعرضه إن توفر

(عرض سياقي) doctor_children / dietitian_children: لبيان ارتباطات الرعاية

عناصر الواجهة المنطقية (IDs/Sections)

#childrenTable (بحث/فرز/تصفية)

#newChildBtn, #editChildBtn, #archiveChildBtn

#childForm (حقول الأساس)

#childStats (عرض الملخّصات إن وجدت)

الحالات والتحقق

full_name مطلوب، dob لا يكون في المستقبل، status ضمن القيم المحددة.

الحقول الملخّصة في children ليست مصدر الحقيقة (تُحدَّث من growth_metrics لاحقًا/يدويًا).

الأفعال والتداعيات

Create/Update/Delete على children (وليّ الأمر فقط على أطفاله).

تحديث اختياري للملخّصات بعد إضافة قياس جديد (إن وُجِد).

الانتقال إلى /child/:childId.

الصلاحيات

guardian: CRUD لأطفاله.

doctor/dietitian: قراءة فقط للأطفال المرتبطين بهما.

admin: كامل.

خطوات الاختبار اليدوي

إضافة طفل جديد باسم وتاريخ ميلاد صحيحين → يظهر في الجدول.

تعديل الحالة إلى archived → اختفاؤه من العرض الافتراضي (مع فلتر يُظهر المؤرشف).

طفل لديه قياس Growth حديث → يظهر الملخص في الجدول.

مستخدم طبيب غير مرتبط بالطفل → لا يرى الطفل.

التنقل إلى ملف الطفل من الصف → يفتح /child/:childId.

أسئلة مفتوحة

هل نسمح بتعديل الملخصات يدويًا أم فقط عبر قياسات growth؟

سياسات حذف الطفل: حذف فعلي أم أرشفة فقط؟
[[END]]
