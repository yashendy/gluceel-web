// lib/supabase-browser.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * متصفح Supabase للـ Client Components
 */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
