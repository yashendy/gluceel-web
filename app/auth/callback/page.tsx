// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    (async () => {
      // تبادل الكود بجلسة
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      // في حالة reset password (PASSWORD_RECOVERY)، Supabase بيعمل session ويحتاج updateUser(password)
      // أسهل: ودّي المستخدم مباشرة لصفحة التحديث:
      router.replace("/update-password");
      if (error) router.replace("/auth/login");
    })();
  }, [router, supabase]);

  return <p className="text-slate-600">جارٍ تفعيل الجلسة…</p>;
}
