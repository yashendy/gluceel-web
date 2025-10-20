import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr";

const roleHome: Record<string, string> = {
  parent: "/parent",
  doctor: "/doctor",
  admin: "/admin",
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // الصيغة الصحيحة: وسيطتان (request/response) ثم خيارات الـURL/KEY
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  const protectedRoots = ["/parent", "/doctor", "/admin"];

  let role: string | null = null;
  if (session) {
    const { data } = await supabase
      .from("profiles")
      .select("system_role")
      .eq("id", session.user.id)
      .single();
    role = (data?.system_role as string) ?? null;
  }

  // ممنوع يزور /login وهو مسجّل
  if (path.startsWith("/login") && session && role) {
    return NextResponse.redirect(new URL(roleHome[role] ?? "/parent", req.url));
  }

  // حماية مسارات الأدوار
  if (protectedRoots.some((p) => path.startsWith(p)) && !session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  // لو داخل جذر دور غير دوره → تحويل
  if (session && role && protectedRoots.includes(path)) {
    const must = roleHome[role];
    if (must && path !== must) return NextResponse.redirect(new URL(must, req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\.(?:\\w+)$).*)"],
};
