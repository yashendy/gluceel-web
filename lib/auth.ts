import { supabaseServer } from './supabase-server';


export async function getSessionAndRole() {
const sb = supabaseServer();
const {
data: { session }
} = await sb.auth.getSession();


if (!session) return { session: null, role: null as null | 'parent' | 'doctor' | 'admin' };


const { data: profile } = await sb
.from('profiles')
.select('system_role')
.eq('id', session.user.id)
.single();


return { session, role: (profile?.system_role ?? null) as any };
}
