window.App = {
  supabase: null,
  session: null,
  profile: null,
  userSettings: null,
  childUnitOverride: null,
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
          p.emergency_contact_name, p.emergency_contact_phone
        ].join(","))
        .eq(p.user_id, this.session.user.id)
        .maybeSingle();
      this.profile = data || { role: "guardian" };
    } catch { this.profile = { role: "guardian" }; }
  },

  async loadUserSettings() {
    try {
      const { data } = await API.getUserSettings();
      this.userSettings = data || { unit_glucose: "mg/dL", locale: "ar", timezone: "Asia/Kuwait" };
    } catch {
      this.userSettings = { unit_glucose: "mg/dL", locale: "ar", timezone: "Asia/Kuwait" };
    }
  },

  toggleLocale() {
    this.locale = this.locale === "ar" ? "en" : "ar";
    localStorage.setItem("locale", this.locale);
    const el = document.getElementById("langLabel");
    if (el) el.innerText = this.locale.toUpperCase();
  },

  setLocale(loc) { this.locale = loc; localStorage.setItem("locale", loc); location.reload(); },

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
    if (App.childUnitOverride) return App.childUnitOverride;                 // وحدة الطفل الفعّالة
    if (App.userSettings?.unit_glucose) return App.userSettings.unit_glucose; // "mg/dL" | "mmol/L"
    return "mg/dL";
  },
  toDisplay(mgdl) {
    if (mgdl == null || Number.isNaN(Number(mgdl))) return "--";
    return this.label() === "mmol/L" ? (Number(mgdl)/18).toFixed(1) : Math.round(Number(mgdl));
  },
  toMgdl(inputValue) {
    if (inputValue == null || inputValue === "" || Number.isNaN(Number(inputValue))) return null;
    return this.label() === "mmol/L" ? Math.round(Number(inputValue) * 18) : Math.round(Number(inputValue));
  },
  displayToChildUnit(u){ return u === "mmol/L" ? "mmol" : "mgdl"; },
  childToDisplayUnit(u){ return u === "mmol" ? "mmol/L" : "mg/dL"; }
};

document.addEventListener("DOMContentLoaded", () => App.init());
