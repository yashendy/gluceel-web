window.App = {
  supabase: null,
  session: null,
  profile: null,
  userSettings: null,
  childUnitOverride: null, // تُضبط عند فتح صفحات طفل محدد
  locale: localStorage.getItem("locale") || "ar",

  init() {
    const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = APP_CONFIG;
    this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    this.bindConn();
    this.loadSession();
  },

  async loadSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.session = session;
    if (session) {
      await this.loadProfile();
      await this.loadUserSettings();
    }
    UI.renderUserMenu();
  },

  async loadProfile() {
    try {
      const p = APP_CONFIG.COLUMNS.profiles;
      const { data } = await this.supabase
        .from(APP_CONFIG.TABLES.profiles)
        .select([
          p.role, p.full_name, p.phone, p.avatar_url,
          p.onboarding_complete, p.default_child_id,
          p.preferred_glucose_unit, p.hypo_default, p.hyper_default,
          p.notify_email, p.notify_push
        ].join(","))
        .eq(p.user_id, this.session.user.id)
        .maybeSingle();
      this.profile = data || { role: "guardian" };
    } catch {
      this.profile = { role: "guardian" };
    }
  },

  async loadUserSettings() {
    try {
      const { data } = await API.getUserSettings();
      this.userSettings = data || { unit_glucose: "mg/dL", locale: "ar", timezone: "Africa/Cairo" };
    } catch {
      this.userSettings = { unit_glucose: "mg/dL", locale: "ar", timezone: "Africa/Cairo" };
    }
  },

  toggleLocale() {
    this.locale = this.locale === "ar" ? "en" : "ar";
    localStorage.setItem("locale", this.locale);
    const el = document.getElementById("langLabel");
    if (el) el.innerText = this.locale.toUpperCase();
  },

  setLocale(loc) {
    this.locale = loc;
    localStorage.setItem("locale", loc);
    location.reload();
  },

  bindConn() {
    const badge = document.getElementById("connStatus");
    const set = (ok) => { if (!badge) return; badge.textContent = ok ? "📶 متصل" : "⚠️ أوفلاين"; badge.className = "badge"; };
    window.addEventListener("online",  () => set(true));
    window.addEventListener("offline", () => set(false));
    set(navigator.onLine);
  }
};

/* ====== Units Helper: mg/dL ⇆ mmol/L ====== */
window.Units = {
  label() {
    // أولوية: override للطفل ← user_settings ← profile.preferred_glucose_unit ← mg/dL
    if (App.childUnitOverride) return App.childUnitOverride;
    if (App.userSettings?.unit_glucose) return App.userSettings.unit_glucose; // "mg/dL" | "mmol/L"
    if (App.profile?.preferred_glucose_unit) return App.profile.preferred_glucose_unit;
    return "mg/dL";
  },
  toDisplay(mgdl) {
    if (mgdl == null || Number.isNaN(Number(mgdl))) return "--";
    const unit = this.label();
    return unit === "mmol/L" ? (Number(mgdl)/18).toFixed(1) : Math.round(Number(mgdl));
  },
  toMgdl(inputValue) {
    if (inputValue == null || inputValue === "" || Number.isNaN(Number(inputValue))) return null;
    const unit = this.label();
    return unit === "mmol/L" ? Math.round(Number(inputValue) * 18) : Math.round(Number(inputValue));
  },
  // تحويل عرضي: من "mg/dL" ⇆ "mgdl" (child_settings) والعكس
  displayToChildUnit(displayUnit) { return displayUnit === "mmol/L" ? "mmol" : "mgdl"; },
  childToDisplayUnit(childUnit)   { return childUnit === "mmol" ? "mmol/L" : "mg/dL"; }
};

document.addEventListener("DOMContentLoaded", () => App.init());
