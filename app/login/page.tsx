// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const redirectTo = params.get("redirectTo") || "/dash";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    router.replace(redirectTo);
  }

  async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) alert(error.message);
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-center mb-2">Gluceel</h1>
        <p className="text-center text-gray-500 mb-6">
          ابدأ بتسجيل الدخول.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded border p-2"
            placeholder="البريد الإلكتروني"
            dir="ltr"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded border p-2"
            placeholder="كلمة المرور"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full rounded bg-black px-4 py-2 text-white"
          >
            تسجيل الدخول
          </button>
        </form>

        <div className="my-4 text-center text-sm">
          <a href="/auth/reset" className="text-blue-600 hover:underline">
            نسيت كلمة المرور؟
          </a>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full rounded border px-4 py-2"
        >
          الدخول بحساب Google
        </button>

        <div className="mt-4 text-center text-sm">
          <span>مستخدم جديد؟ </span>
          <a href="/auth/register" className="text-blue-600 hover:underline">
            إنشاء حساب
          </a>
        </div>
      </div>
    </main>
  );
}
