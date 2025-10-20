import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const roleHome: Record<string, string> = {
  parent: "/parent",
  doctor: "/doctor",
  admin: "/admin",
};

export async function middleware(req: NextRequest) {
  // لازم نبدأ Response ونمرر الهيدر عشان Next يحافظ على الكوكيز
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  // عميل Supabase للـ Edge Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  const protectedRoots = ["/parent", "/doctor", "/admin"];

  // لو مسجّل دخول إبعده عن /login
  if (path.startsWith("/login") && session) {
    // نقرأ الدور
    const { data } = await supabase
      .from("profiles")
      .select("system_role")
      .eq("id", session.user.id)
      .single();

    const role = (data?.system_role as string) ?? "parent";
    return NextResponse.redirect(new URL(roleHome[role] ?? "/parent", req.url));
  }

  // حماية المسارات المحمية
  if (protectedRoots.some((p) => path.startsWith(p)) && !session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  // لو داخل جذر دور غير دوره → نحوله
  if (session && protectedRoots.includes(path)) {
    const { data } = await supabase
      .from("profiles")
      .select("system_role")
      .eq("id", session.user.id)
      .single();

    const role = (data?.system_role as string) ?? "parent";
    const must = roleHome[role] ?? "/parent";
    if (path !== must) return NextResponse.redirect(new URL(must, req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\.(?:\\w+)$).*)"], // تجاهل الملفات الساكنة
};
