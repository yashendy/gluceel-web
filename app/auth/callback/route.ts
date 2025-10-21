import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    // دي اللي بتسجل الكوكيز بالجلسة
    await supabase.auth.exchangeCodeForSession(code)
  }

  // لو كان في ?next=/xxx هرجعله، غير كده للـ /
  const next = url.searchParams.get('next') ?? '/'
  return NextResponse.redirect(new URL(next, request.url))
}
