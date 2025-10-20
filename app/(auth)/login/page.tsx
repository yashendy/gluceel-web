"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const [nextUrl, setNextUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const n = new URLSearchParams(window.location.search).get("next") || "";
      setNextUrl(n);
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const sb = supabaseBrowser();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    // اقرأ الدور ووجّه على الصفحة المناسبة
    const { data: profile } = await sb
      .from("profiles")
      .select("system_role")
      .eq("id", data.user?.id)
      .single();

    const role = (profile?.system_role as "parent" | "doctor" | "admin" | undefined) || "parent";
    const home: Record<string, string> = { parent: "/parent", doctor: "/doctor", admin: "/admin" };
    router.replace(nextUrl || home[role]);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-gray-100 flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">

          {/* العمود الأيسر: لوجو ورسالة (ستايل شبيه فيسبوك) */}
          <div className="md:w-1/2 text-center md:text-right">
            <div className="text-4xl md:text-5xl font-extrabold text-blue-600">Gluceel</div>
            <p className="mt-4 text-gray-700 text-lg md:text-xl leading-relaxed">
              منصة أسيل لمتابعة سكر الأطفال وضبط الوجبات —
              عناية أسرية دافئة 💙
            </p>
          </div>

          {/* العمود الأيمن: كارت تسجيل الدخول */}
          <div className="md:w-1/2 w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow p-6 md:p-7">
              <form onSubmit={onSubmit} className="space-y-4">
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
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition"
                >
                  {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
                </button>

                <div className="text-center">
                  <Link
                    href="/reset"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </form>

              <div className="h-px bg-gray-200 my-4" />

              <div className="text-center">
                <Link
                  href="/register"
                  className="inline-block rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
