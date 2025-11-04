
window.App = {
  supabase:null, session:null, profile:null, locale:localStorage.getItem("locale")||"ar",
  init(){ const {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY}=APP_CONFIG; this.supabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY); this.bindConn(); this.loadSession(); },
  async loadSession(){
    const { data:{ session } } = await this.supabase.auth.getSession();
    this.session=session;
    if(session){
      const uid=session.user.id;
      try{ const { data }=await this.supabase.from(APP_CONFIG.TABLES.profiles).select("role").eq("user_id",uid).maybeSingle(); this.profile={role:data?.role||"guardian"}; }catch(e){ this.profile={role:"guardian"}; }
    }
    UI.renderUserMenu();
  },
  toggleLocale(){ this.locale=this.locale==="ar"?"en":"ar"; localStorage.setItem("locale",this.locale); document.getElementById("langLabel")?.innerText=this.locale.toUpperCase(); },
  setLocale(loc){ this.locale=loc; localStorage.setItem("locale",loc); location.reload(); },
  bindConn(){ const badge=document.getElementById("connStatus"); const set=(ok)=>{ if(!badge)return; badge.textContent= ok? "📶 متصل":"⚠️ أوفلاين"; badge.className="badge"; }; window.addEventListener("online",()=>set(true)); window.addEventListener("offline",()=>set(false)); set(navigator.onLine); }
};
document.addEventListener("DOMContentLoaded", ()=>App.init());
