// app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function registerParentAction(formData: FormData) {
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!full_name || !email || !password) {
    return { ok: false, message: "من فضلك املأ كل الحقول المطلوبة." };
  }

  const supabase = createServerActionClient({ cookies });

  // signUp: نحفظ full_name في user_metadata، والـ role الافتراضي في DB = 'parent'
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      // لو عايزة تفعيل عبر الإيميل فعّليه من لوحة Supabase وسيبّي redirect:
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    // لو مفعلين Confirm Email:
    message: "تم إنشاء الحساب! من فضلك تفقد بريدك الإلكتروني لتفعيل الحساب.",
  };
}

export async function sendResetLinkAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const supabase = createServerActionClient({ cookies });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك." };
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
