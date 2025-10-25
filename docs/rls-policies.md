[[BEGIN]]
docs/rls-policies.md — سياسات RLS نصّيًا (v1.2)

هذا المستند يحدّد سلوك RLS نصّيًا (بدون SQL) للأدوار: guardian / doctor / dietitian / admin، حسب جداول db-schema v1.2.

مبادئ عامة

التعريف:

«طفلي»: أي سجل مرتبط بـ children.guardian_id = {profile.id}.

«مرتبط مهنيًا»: عبر doctor_children / dietitian_children بالحالة active.

«مالِك السجل»: من كتب الحقل created_by = {profile.id} (إن وُجد).

القراءة الافتراضية: المبدأ الأقل امتيازًا (Least Privilege). لا كشف لبيانات لا لزوم لها.

الكتابة الافتراضية: محصورة بالمالِك أو بالدور المختص (طبيب/تغذية) أو admin.

الحقول الحسّاسة (PII): يمكن حجبها/إخفاؤها للغير (مثال: أرقام هواتف غير ذات صلة).

كل الجداول: admin = قراءة/كتابة/حذف كامل + إدارة الربط والقواميس.

الحسابات والأدوار
profiles

guardian: قراءة/تحديث ملفه فقط (full_name, phone, active_role). لا حذف. قراءة محدودة لملفات مقدّمي الرعاية المرتبطين بأطفاله (الاسم/التخصص فقط).

doctor: قراءة/تحديث ملفه فقط. قراءة محدودة لملفات أولياء أمور/أطفال مرتبطين به (الاسم فقط).

dietitian: مثل doctor.

admin: كامل.

roles

guardian/doctor/dietitian: قراءة فقط.

admin: CRUD كامل.

user_roles

guardian/doctor/dietitian: قراءة أدوارهم فقط.

admin: CRUD كامل وربط الأدوار بالمستخدمين.

الأطفال والعلاقات
children

guardian: CRUD لأطفاله فقط.

doctor: قراءة «الأطفال المرتبطين» به (active). لا كتابة.

dietitian: قراءة «الأطفال المرتبطين» به (active). لا كتابة.

admin: CRUD كامل.

growth_metrics

guardian: CRUD لسجلات أطفالِه (source ∈ {home,device,import}). لا تعديل على سجلات العيادة.

doctor: CRUD لسجلات «مرتبط» source=clinic فقط. قراءة باقي السجلات لأطفال مرتبطين به.

dietitian: قراءة فقط لأطفال مرتبطين به.

admin: CRUD كامل.

doctor_children

guardian: قراءة روابط أطفاله مع الأطباء (للعِلم). لا كتابة.

doctor: قراءة روابطه فقط. لا إنشاء/إنهاء (إلا عبر admin).

dietitian: لا وصول.

admin: CRUD كامل.

dietitian_children

guardian: قراءة روابط أطفاله مع أخصائيي التغذية. لا كتابة.

doctor: لا وصول.

dietitian: قراءة روابطه فقط. لا إنشاء/إنهاء (إلا عبر admin).

admin: CRUD كامل.

ملف السكري وخطط الأهداف
child_diabetes_profiles

guardian: قراءة الإصدارات الخاصة بأطفاله (active, superseded, draft إن كان منشئًا بنقاش؟ الافتراضي: قراءة جميعها). لا كتابة.

doctor: CRUD لملفات الأطفال المرتبطين به. النشر/الإلغاء بيده.

dietitian: قراءة فقط.

admin: CRUD كامل.

diabetes_targets

guardian: قراءة لأطفالِه. لا كتابة.

doctor: CRUD لأطفال مرتبطين به.

dietitian: قراءة فقط.

admin: CRUD كامل.

carb_goals_per_meal

guardian: قراءة لأطفالِه. لا كتابة.

doctor: قراءة/تعليق (اختياري)، لا تعديل إن كان النهج مؤسّسًا للتغذية (الافتراضي: قراءة فقط).

dietitian: CRUD لأطفال مرتبطين به.

admin: CRUD كامل.

carb_ratio_per_meal

guardian: قراءة لأطفالِه. لا كتابة.

doctor: CRUD لأطفال مرتبطين به.

dietitian: قراءة فقط.

admin: CRUD كامل.

basal_profile_segments

guardian: قراءة لأطفالِه. لا كتابة.

doctor: CRUD لأطفال مرتبطين به.

dietitian: قراءة فقط.

admin: CRUD كامل.

mdi_basal_doses

guardian: قراءة لأطفالِه. لا كتابة.

doctor: CRUD لأطفال مرتبطين به.

dietitian: قراءة فقط.

admin: CRUD كامل.

القياسات والإنسولين والكيتو
glucose_readings

guardian: CRUD لقياسات أطفالِه.

doctor: قراءة لأطفال مرتبطين به؛ يمكن إضافة ملاحظة/تصنيف (إن فُعلت حقل note/classed_at) دون تغيير القيمة.

dietitian: قراءة لأطفال مرتبطين به.

admin: CRUD كامل.

insulin_doses

guardian: CRUD لجرعات أطفالِه.

doctor: قراءة لأطفال مرتبطين به.

dietitian: قراءة لأطفال مرتبطين به.

admin: CRUD كامل.

keto_readings

guardian: CRUD لأطفالِه.

doctor/dietitian: قراءة لأطفال مرتبطين بهما.

admin: CRUD كامل.

التغذية (القواميس والصنّاع)
food_categories

guardian/doctor/dietitian: قراءة فقط.

admin: CRUD كامل.

food_items

guardian: قراءة العناصر الفعّالة العامة. CRUD لعناصر source=user التي أنشأها (created_by=نفسه) فقط.

doctor: قراءة.

dietitian: CRUD للعناصر العامة (source≠user). قراءة عناصر المستخدمين.

admin: CRUD كامل.

food_portions

guardian: CRUD لقياسات عناصره الخاصة (source=user لعناصره). قراءة القياسات العامة.

doctor: قراءة.

dietitian: CRUD للقياسات العامة. قراءة قياسات المستخدمين.

admin: CRUD كامل.

الوجبات
meals

guardian: CRUD لوجبات أطفالِه.

doctor: قراءة لأطفال مرتبطين به.

dietitian: قراءة لأطفال مرتبطين به (لا تعديل).

admin: CRUD كامل.

meal_items

guardian: CRUD لبنود وجبات أطفالِه.

doctor/dietitian: قراءة لأطفال مرتبطين بهما.

admin: CRUD كامل.

خطط التغذية
diet_plans

guardian: قراءة الإصدارات الخاصة بأطفالِه (active ودraft للعرض). لا كتابة.

doctor: قراءة لأطفال مرتبطين به.

dietitian: CRUD لأطفال مرتبطين به (إنشاء/نشر/إحالة).

admin: CRUD كامل.

diet_plan_meals

guardian: قراءة فقط.

doctor: قراءة فقط.

dietitian: CRUD ضمن خطط هو منشئها/مسؤول عنها لأطفال مرتبطين به.

admin: CRUD كامل.

الزيارات والتوصيات
visits

guardian: قراءة زيارات أطفالِه.

doctor: CRUD للزيارات حيث provider_profile_id = نفسه وprovider_role=doctor ولأطفال مرتبطين به.

dietitian: CRUD للزيارات حيث provider_profile_id = نفسه وprovider_role=dietitian ولأطفال مرتبطين به.

admin: CRUD كامل.

visit_recommendations

guardian: قراءة توصيات زيارات أطفالِه.

doctor/dietitian: CRUD داخل زياراتهم فقط.

admin: CRUD كامل.

الأجهزة والملفات
device_catalog

الجميع: قراءة.

admin: CRUD كامل.

child_devices

guardian: قراءة أجهزة طفله.

doctor/dietitian: قراءة لأطفال مرتبطين بهما.

admin: CRUD كامل (الربط/الإنهاء/الحالة).

attachments

guardian: قراءة مرفقات طفله؛ CRUD لِما رفعه بنفسه فقط.

doctor/dietitian: قراءة مرفقات أطفال مرتبطين بهما؛ CRUD لما رفعوه بأنفسهم فقط.

admin: CRUD كامل.

الإشعارات والتدقيق والتحليلات
notifications

guardian/doctor/dietitian: قراءة إشعاراتهم فقط (recipient_profile_id=نفسه). تحديث is_read لإشعاراتهم.

admin: قراءة الجميع؛ إرسال/حذف وفق السياسات.

audit_logs

admin: قراءة كاملة.

غير ذلك: لا وصول (إلا إظهار آثار ذاتية مُختصرة عند الحاجة — اختياري).

analytics_daily

guardian: قراءة لأطفالِه.

doctor/dietitian: قراءة لأطفال مرتبطين بهما.

admin: CRUD (عادةً كتابة نظامية فقط).

التخزين (Storage Buckets) — تذكير سياسات

food-items:

القراءة: عامة/مقيّدة وفق is_active والمصدر.

الكتابة: dietitian/admin لعناصر عامة؛ المالك فقط لعناصر source=user.

attachments:

القراءة: guardian لطفله، وdoctor/dietitian للمربوطين؛ admin كامل.

الكتابة/الحذف: الرافع فقط + admin.

ملاحظات تنفيذية

كل كتابة تُسجَّل في audit_logs تلقائيًا.

إنهاء الربط المهني يوقف فورًا القراءة/الكتابة القائمة على «مرتبط مهنيًا».

أي استثناء يُدار بتذكرة وتعديل RLS لاحقًا.

انتهى.
[[END]]
