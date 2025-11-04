window.Auth={
  async login(){ const email=document.getElementById('loginEmail')?.value, password=document.getElementById('loginPass')?.value;
    const {error}=await App.supabase.auth.signInWithPassword({email,password}); if(error){UI.toast(error.message);return;} UI.toast("أهلاً 👋"); location.href=APP_CONFIG.BASE_PATH+"pages/children.html"; },
  async signup(){ const email=document.getElementById('signupEmail')?.value, password=document.getElementById('signupPass')?.value, role=document.getElementById('signupRole')?.value||"guardian"; const doctorCode=document.getElementById('doctorCode')?.value||null;
    const {data,error}=await App.supabase.auth.signUp({email,password}); if(error){UI.toast(error.message);return;}
    try{ await App.supabase.from(APP_CONFIG.TABLES.profiles).upsert({user_id:data.user.id, role}); }catch(e){}
    if(role==='doctor'){ location.href=APP_CONFIG.BASE_PATH+"pages/doctor-code.html"; } else { location.href=APP_CONFIG.BASE_PATH+"pages/children.html"; }
  },
  async reset(){ const email=document.getElementById('resetEmail')?.value; const {error}=await App.supabase.auth.resetPasswordForEmail(email,{redirectTo:APP_CONFIG.PUBLIC_SITE_URL+"auth/callback.html"}); if(error){UI.toast(error.message);return;} UI.toast("تم إرسال الرابط"); },
  async handleCallback(){ setTimeout(()=>{ location.href=APP_CONFIG.BASE_PATH+"pages/children.html"; },800); },
  async logout(){ await App.supabase.auth.signOut(); location.href=APP_CONFIG_BASE_PATH; }
};
