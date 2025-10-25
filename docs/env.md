gluceel-web — Environment Variables (v1)

هذا المستند يعرّف أسماء المتغيّرات فقط وكيفية استخدامها. لا تحفظ أي مفاتيح فعلية هنا.
القاعدة الذهبية: مفاتيح العميل فقط تبدأ بـ NEXT_PUBLIC_، وأي مفتاح حساس يظل سيرفر فقط (Vercel Env).

المتغيّرات (الأسماء المعتمدة)

NEXT_PUBLIC_SUPABASE_URL → (Public) من مشروع Supabase

NEXT_PUBLIC_SUPABASE_ANON_KEY → (Public) مفتاح Anon

SUPABASE_SERVICE_ROLE → (Server-only) لا يستخدم أبدًا في المتصفح

AUTH_REDIRECT_URLS_LOCAL → http://localhost:3000/auth/callback

AUTH_REDIRECT_URLS_PREVIEW → مثال: https://*.vercel.app/auth/callback

AUTH_REDIRECT_URLS_PROD → مثال: https://gluceel-web.com/auth/callback

(اختياري) SITE_URL_LOCAL / SITE_URL_PREVIEW / SITE_URL_PROD للتسهيل

(اختياري لاحقًا) EMAIL_FROM, SMTP_HOST, SMTP_USER, SMTP_PASS لو فعّلنا إشعارات عبر البريد

أين نضع القيم الفعلية؟

Development (محلي): ملف .env.local (لا يُكمِّت)

Preview/Production (Vercel): من لوحة Vercel → Project → Settings → Environment Variables

عيّني القيم في Preview وProduction.

استخدمي wildcard في Redirect URLs للـPreview (https://*.vercel.app/auth/callback).

ملاحظات أمان سريعة

لا تضعي SUPABASE_SERVICE_ROLE في أي مكان على العميل.

أي استدعاء يحتاج صلاحيات أعلى يتم من Route Handler/Server Function فقط.

عند تغيير Redirect URLs في Supabase، حدّثيها هنا وفي Vercel سويًا.

تشيكليست بعد الضبط

 وضع NEXT_PUBLIC_SUPABASE_URL وNEXT_PUBLIC_SUPABASE_ANON_KEY محليًا وعلى Vercel.

 إضافة Redirect URLs (Local/Preview/Prod) في Supabase Auth وVercel.

 التأكد أن متغيّرات السيرفر غير مسبوقة بـ NEXT_PUBLIC_.
