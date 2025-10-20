"use client";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ParentDash() {
  const logout = async () => { await supabaseBrowser().auth.signOut(); location.href = "/login"; };

  return (
    <main className="container">
      <div className="card mt-10">
        <h1 className="text-xl font-semibold">لوحة الوالد</h1>
        <p className="text-sm text-gray-600">مرحبًا بك 👋</p>
        <div className="mt-4">
          <button className="btn" onClick={logout}>تسجيل خروج</button>
        </div>
      </div>
    </main>
  );
}
