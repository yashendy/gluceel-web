// app/(auth)/login/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signInWithPasswordAction } from "@/app/actions/auth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClientComponentClient();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await signInWithPasswordAction(formData);
      if (!res.ok) {
        setError(res.message || "حدث خطأ أثناء تسجيل الدخول");
      } else {
        window.location.href = "/"; // أو لوحة ولي الأمر /dashboard
      }
    });
  }

  async function signInWithGoogle() {
    setError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    if (data?.url) window.location.href = data.url;
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">تسجيل الدخول</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
          <input
            name="email"
            type="email"
            required
            placeholder="example@email.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-sky-200 focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">كلمة المرور</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 outline-none ring-sky-200 focus:ring-2"
            />
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="إظهار/إخفاء كلمة المرور"
            >
              {showPassword ? "إخفاء" : "إظهار"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          disabled={pending}
          className="w-full rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
        >
          {pending ? "جاري الدخول..." : "دخول"}
        </button>

        <div className="my-2 text-center text-sm text-slate-500">أو</div>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold hover:bg-slate-50"
        >
          الدخول بحساب Google
        </button>

        <div className="mt-3 flex items-center justify-between text-sm">
          <Link href="/auth/forgot" className="text-sky-600 hover:underline">
            نسيت كلمة المرور؟
          </Link>
          <Link href="/auth/register" className="text-sky-600 hover:underline">
            مستخدم جديد؟ أنشئ حسابًا
          </Link>
        </div>
      </form>
    </>
  );
}
