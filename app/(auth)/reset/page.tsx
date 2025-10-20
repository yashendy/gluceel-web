"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const sb = supabaseBrowser();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/update-password`
        : undefined;

    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);

    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-gray-100 flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
          <h1 className="text-xl font-semibold mb-4">إعادة تعيين كلمة المرور</h1>

          {sent ? (
            <p className="text-green-700">
              تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني. من فضلك افحص بريدك.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition"
              >
                {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
