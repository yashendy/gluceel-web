"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const sb = supabaseBrowser();
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-gray-100 flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
          <h1 className="text-xl font-semibold mb-4">إنشاء حساب جديد</h1>

          {sent ? (
            <p className="text-green-700">
              تم إنشاء الحساب. من فضلك تحقّقي من بريدك الإلكتروني لتفعيل الحساب.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="الاسم الكامل"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="كلمة المرور"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-3 transition"
              >
                {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
