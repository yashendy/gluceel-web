"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export const dynamic = "force-dynamic";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("تأكيد كلمة المرور غير مطابق");
      return;
    }

    setLoading(true);
    const sb = supabaseBrowser();

    const { error } = await sb.auth.updateUser({ password });
    setLoading(false);

    if (error) setError(error.message);
    else {
      setOk(true);
      setTimeout(() => router.replace("/login"), 1200);
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-gray-100 flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
          <h1 className="text-xl font-semibold mb-4">تعيين كلمة مرور جديدة</h1>

          {ok ? (
            <p className="text-green-700">تم التحديث بنجاح، سيتم تحويلك لصفحة الدخول…</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="كلمة المرور الجديدة"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition"
              >
                {loading ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
