import Header from '@/components/Header';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function Page() {
  const supa = supabaseServer();
  const { data } = await supa.auth.getUser();
  if (!data.user) redirect('/login');
  return (
    <main className="max-w-4xl mx-auto p-6">
      <Header title="لوحة الأدمن" />
      <section className="rounded-2xl border p-5 mt-4">
        <p>مرحباً بك! هذه صفحة الأدمن (نموذجية).</p>
      </section>
    </main>
  );
}
