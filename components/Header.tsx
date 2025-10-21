'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function Header({ title }: { title?: string }) {
  const router = useRouter();
  async function logout() {
    const supa = supabaseBrowser();
    await supa.auth.signOut();
    router.push('/login');
  }
  return (
    <header className="w-full flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Gluceel" className="h-8 w-8" />
        <Link href="/" className="font-semibold">Gluceel</Link>
        {title ? <span className="opacity-70">— {title}</span> : null}
      </div>
      <nav className="flex items-center gap-3">
        <Link href="/parent" className="underline">لوحة ولي الأمر</Link>
        <Link href="/doctor" className="underline">لوحة الطبيب</Link>
        <Link href="/admin" className="underline">لوحة الأدمن</Link>
        <button onClick={logout} className="rounded-md border px-3 py-1">تسجيل الخروج</button>
      </nav>
    </header>
  );
}
