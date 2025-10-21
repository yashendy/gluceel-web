// app/(auth)/forgot/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { sendResetLinkAction } from "@/app/actions/auth";

export default function ForgotPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await sendResetLinkAction(formData);
      if (!res.ok) setError(res.message || "حدث خطأ أثناء الإرسال");
      else setOkMsg(res.message || "تم إرسال الرابط إلى بريدك.");
    });
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">استعادة كلمة المرور</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-sky-200 focus:ring-2"
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {okMsg && <p className="text-sm text-emerald-600">{okMsg}</p>}

        <button
          disabled={pending}
          className="w-full rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
        >
          {pending ? "جاري الإرسال..." : "أرسل رابط إعادة التعيين"}
        </button>

        <div className="mt-3 text-sm">
          <Link href="/auth/login" className="text-sky-600 hover:underline">
            الرجوع لتسجيل الدخول
          </Link>
        </div>
      </form>
    </>
  );
}
