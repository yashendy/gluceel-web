// app/(auth)/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registerParentAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await registerParentAction(formData);
      if (!res.ok) {
        setError(res.message || "حدث خطأ أثناء إنشاء الحساب");
      } else {
        setOkMsg(res.message || "تم إنشاء الحساب بنجاح!");
      }
    });
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">إنشاء حساب وليّ أمر</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">الاسم الكامل</label>
          <input
            name="full_name"
            type="text"
            required
            placeholder="الاسم كما سيظهر في الملف"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-sky-200 focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-sky-200 focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">كلمة المرور</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-sky-200 focus:ring-2"
          />
          <p className="mt-1 text-xs text-slate-500">يُفضّل ٨ أحرف على الأقل مع أرقام وحروف.</p>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {okMsg && <p className="text-sm text-emerald-600">{okMsg}</p>}

        <button
          disabled={pending}
          className="w-full rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
        >
          {pending ? "جاري الإنشاء..." : "إنشاء حساب"}
        </button>

        <div className="mt-3 text-sm">
          لديك حساب؟{" "}
          <Link href="/auth/login" className="text-sky-600 hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </form>

      <p className="mt-6 text-xs text-slate-500">
        بالتسجيل أنت توافق على{" "}
        <Link href="/terms" className="text-sky-600 hover:underline">
          الشروط
        </Link>{" "}
        و{" "}
        <Link href="/privacy" className="text-sky-600 hover:underline">
          سياسة الخصوصية
        </Link>
        .
      </p>
    </>
  );
}
