gluceel-web — Onboarding Roles (v1)

هذا الدليل يشرح تهيئة الأدوار وربطها بالمستخدمين لأول مرة — بدون SQL. التنفيذ الفعلي يتم عبر Supabase UI أو سكريبت Service Role (لاحقًا).

الهدف

إنشاء الأدوار الأساسية: guardian, doctor, dietitian, admin

ربط مستخدم واحد على الأقل بدور admin (لتسيير الأمور)

ضبط active_role لسهولة التوجيه وحراسة المسارات

الخطوات

إنشاء الأدوار (roles):
أدخلي السجلات التالية يدويًا في جدول roles:

slug=guardian, name=وليّ أمر, is_system=true, is_active=true

slug=doctor, name=طبيب, is_system=true, is_active=true

slug=dietitian, name=أخصائي تغذية, is_system=true, is_active=true

slug=admin, name=مسؤول, is_system=true, is_active=true

تسجيل الدخول الأول (Supabase Auth):
سجّلي دخولك بحساب Google (أو الحساب المعتمد).

سيتولّد صف في profiles بـ auth_user_id الخاص بك.

حدّدي profiles.active_role='admin' مؤقتًا (سيرفر/لوحة).

ربط المستخدم بالأدوار (user_roles):

أضيفي سطرًا على الأقل لربط حسابك بـ admin (is_primary=true, is_active=true).

لو عندكم حسابات اختبار: اربطي حسابين افتراضيين كـ doctor وdietitian.

اختبار التبديل:
من الواجهة (لاحقًا)، جرّبي التبديل بين الأدوار الممنوحة للتأكد أن active_role يتغير بشكل صحيح.

ملاحظات وسياسات

لا نوقف RLS وقت التهيئة؛ استخدمي حساب/سكريبت Service Role أو Supabase SQL Editor.

لا تمنحي أكثر من دور نشط فعليًا؛ active_role واحد لكل مستخدم — بينما user_roles قد تحتوي أدوارًا متعددة.

أي تعديلات لاحقة على الأدوار عبر شاشة /admin فقط (سيرفر).

ما بعد الإعداد

جهّزي حسابات اختبار: وليّ أمر + طفل واحد + ربط الطفل بطبيب وأخصائي (عبر doctor_children / dietitian_children).

سجّلي هذه الروابط لاستخدامها في اختبارات صفحات: /child/:childId/*, /doctor/*, /dietitian/*.
