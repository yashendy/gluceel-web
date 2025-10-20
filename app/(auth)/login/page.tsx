'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';


export default function LoginPage() {
const router = useRouter();
const sp = useSearchParams();
const next = sp.get('next') || '';
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);


const onSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);
const supabase = supabaseBrowser();
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
setLoading(false);
if (error) { setError(error.message); return; }


// fetch role and redirect
const { data: profile } = await supabase
.from('profiles')
.select('system_role')
.eq('id', data.user?.id)
.single();


const role = (profile?.system_role as 'parent' | 'doctor' | 'admin' | undefined) || 'parent';
const roleHome: Record<string, string> = { parent: '/parent', doctor: '/doctor', admin: '/admin' };
router.replace(next || roleHome[role]);
};


return (
<main className="container">
<div className="card mt-10 max-w-md mx-auto">
<h1 className="text-xl font-semibold mb-4">تسجيل الدخول</h1>
<form onSubmit={onSubmit} className="space-y-3">
<input className="w-full border rounded-xl p-3" type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e)=>setEmail(e.target.value)} required />
<input className="w-full border rounded-xl p-3" type="password" placeholder="كلمة المرور" value={password} onChange={(e)=>setPassword(e.target.value)} required />
{error && <div className="text-sm text-red-600">{error}</div>}
<button disabled={loading} className="btn btn-primary w-full" type="submit">
{loading ? 'جارٍ الدخول...' : 'دخول'}
</button>
</form>
</div>
</main>
);
}
