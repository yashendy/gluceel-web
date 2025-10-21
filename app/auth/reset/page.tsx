// app/auth/reset/page.tsx
"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`,
    });
    if (error) return alert(error.message);
    alert("تم إرسال رابط تعيين كلمة المرور إلى بريدك الإلكتروني.");
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-xl font-bold mb-4 text-center">استرجاع كلمة المرور</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded border p-2"
            placeholder="البريد الإلكتروني"
            dir="ltr"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="w-full rounded bg-black px-4 py-2 text-white">
            إرسال الرابط
          </button>
        </form>
      </div>
    </main>
  );
}
