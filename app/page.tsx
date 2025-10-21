import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function Home() {
  const supa = supabaseServer();
  const { data } = await supa.auth.getUser();

  if (!data.user) {
    redirect('/login');
  }

  const role = (data.user.user_metadata?.role as string) || 'parent';
  const roleHome: Record<string, string> = {
    parent: '/parent',
    doctor: '/doctor',
    admin: '/admin',
  };
  redirect(roleHome[role] ?? '/parent');
}
