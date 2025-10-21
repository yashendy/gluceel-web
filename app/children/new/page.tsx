'use client';

"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";


export default function NewChild() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function signUp() {
    setError(null);
    const supa = supabaseBrowser();
    const { data, error } = await supa.auth.signUp({
      email, password,
      options: { data: { role: 'parent' } }
    });
    if (error) return setError(error.message);
    // بعد التسجيل، غالباً يحتاج تأكيد بريد؛ سنعيد للمستخدم صفحة الدخول.
    router.push('/login');
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">إنشاء حساب (ولي أمر)</h1>
      <label className="block mb-3">
        <span className="block mb-1">البريد الإلكتروني</span>
        <input className="w-full rounded-md border px-3 py-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      </label>
      <label className="block mb-3">
        <span className="block mb-1">كلمة المرور</span>
        <input className="w-full rounded-md border px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      </label>
      {error ? <p className="text-red-600 mb-2">{error}</p> : null}
      <button onClick={signUp} className="rounded-md bg-blue-600 text-white px-4 py-2">تسجيل</button>
    </main>
  );
}
