'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function LoginPage() {
  const supa = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supa.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    const role = (data.user?.user_metadata?.role as string) || 'parent';
    const roleHome: Record<string, string> = { parent: '/parent', doctor: '/doctor', admin: '/admin' };
    router.push(roleHome[role] ?? '/parent');
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Header />
      <div className="text-center mt-6">
        <h1 className="text-3xl font-bold">Gluceel</h1>
        <p className="opacity-80 mt-2">منصة أسيل لمتابعة سكر الأطفال وضبط الوجبات — عناية أسرية دافئة 💙</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <form onSubmit={onSubmit} className="rounded-2xl border p-5">
          <label className="block mb-3">
            <span className="block mb-1">البريد الإلكتروني</span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="block mb-3">
            <span className="block mb-1">كلمة المرور</span>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>
          {error ? <p className="text-red-600 mb-2">{error}</p> : null}
          <button
            disabled={loading}
            className="rounded-md bg-blue-600 text-white px-4 py-2 w-full"
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>

          <div className="flex items-center justify-between mt-4 text-sm">
            <a href="/auth/update-password" className="underline">نسيت كلمة المرور؟</a>
            <a href="/children/new" className="underline">إنشاء حساب جديد (ولي أمر)</a>
          </div>
        </form>

        <aside className="rounded-2xl border p-5">
          <h2 className="font-semibold mb-2">ليه نهتم بالسكر؟</h2>
          <ul className="list-disc mr-5 space-y-1 text-sm">
            <li>قياس منتظم يساعدنا نفهم جسمنا ونحافظ على نشاطنا.</li>
            <li>وجبات متوازنة = طاقة ولعب بدون هبوط مفاجئ.</li>
            <li>ماء ونوم كفاية لأفضل تركيز ومزاج.</li>
            <li>سِجل قياساتك عشان الدكتور وبابا وماما يتابعوا بسهولة.</li>
          </ul>
          <p className="mt-4 text-sm opacity-70">الدعم: <a className="underline" href="mailto:support@gluceel.com">support@gluceel.com</a></p>
        </aside>
      </div>
    </div>
  );
}
