'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function UpdatePasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendReset() {
    setError(null);
    const supa = supabaseBrowser();
    const { error } = await supa.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">نسيت كلمة المرور</h1>
      <p className="opacity-70 mb-4">أدخل بريدك وسنرسل لك رابط إعادة تعيين كلمة المرور.</p>
      <input
        type="email"
        placeholder="your@email.com"
        className="w-full rounded-md border px-3 py-2 mb-3"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      {error ? <p className="text-red-600 mb-2">{error}</p> : null}
      {sent ? <p className="text-green-700 mb-2">تم إرسال الرابط إلى بريدك.</p> : null}
      <button onClick={sendReset} className="rounded-md bg-blue-600 text-white px-4 py-2">إرسال الرابط</button>
    </main>
  );
}
