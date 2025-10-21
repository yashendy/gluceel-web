// app/update-password/page.tsx
"use client";

import { useState, useTransition } from "react";
import { updatePasswordAction } from "@/app/actions/auth";

export default function UpdatePasswordPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updatePasswordAction(formData);
      if (!res.ok) setError(res.message || "تعذّر تحديث كلمة المرور");
      else setOk(true);
    });
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-slate-800">تعيين كلمة مرور جديدة</h1>

          {ok ? (
            <>
              <p className="text-emerald-600">تم تحديث كلمة المرور بنجاح ✅</p>
              <a
                href="/auth/login"
                className="mt-4 inline-block rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white hover:bg-sky-600"
              >
                الذهاب لتسجيل الدخول
              </a>
            </>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">كلمة المرور الجديدة</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-sky-200 focus:ring-2"
                />
              </div>

              {error && <p className="text-sm text-rose-600">{error}</p>}

              <button
                disabled={pending}
                className="w-full rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
              >
                {pending ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
