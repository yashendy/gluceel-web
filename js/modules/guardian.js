window.Guardian = {
  async init(){
    await App.loadSession(); // يضمن profile + userSettings
    this.fillProfileForm();
    this.fillSettingsForm();
  },

  // ------ UI Helpers ------
  val(id){ const el=document.getElementById(id); return el ? el.value : ""; },
  setVal(id, v){ const el=document.getElementById(id); if(el) el.value = (v ?? ""); },
  setChk(id, v){ const el=document.getElementById(id); if(el) el.checked = !!v; },

  // ------ Load to form ------
  fillProfileForm(){
    const p = App.profile || {};
    this.setVal("g_full_name", p.full_name);
    this.setVal("g_phone",     p.phone);
    this.setVal("g_emg_name",  p.emergency_contact_name);
    this.setVal("g_emg_phone", p.emergency_contact_phone);
    this.setChk("g_notify_email", p.notify_email);
    this.setChk("g_notify_push",  p.notify_push);
  },
  fillSettingsForm(){
    const s = App.userSettings || {};
    this.setVal("g_locale",   s.locale || App.locale || "ar");
    this.setVal("g_timezone", s.timezone || "Africa/Cairo");
    this.setVal("g_unit",     s.unit_glucose || "mg/dL");
    const unitLabel = s.unit_glucose || "mg/dL";
    const span = document.getElementById("g_unit_hint");
    if (span) span.textContent = unitLabel;
  },

  // ------ Save actions ------
  async saveProfile(){
    const patch = {};
    patch[APP_CONFIG.COLUMNS.profiles.full_name] = this.val("g_full_name");
    patch[APP_CONFIG.COLUMNS.profiles.phone]     = this.val("g_phone");
    patch[APP_CONFIG.COLUMNS.profiles.emergency_contact_name]  = this.val("g_emg_name");
    patch[APP_CONFIG.COLUMNS.profiles.emergency_contact_phone] = this.val("g_emg_phone");
    patch[APP_CONFIG.COLUMNS.profiles.notify_email] = document.getElementById("g_notify_email")?.checked || false;
    patch[APP_CONFIG.COLUMNS.profiles.notify_push]  = document.getElementById("g_notify_push")?.checked  || false;

    const { error } = await API.updateOwnProfile(patch);
    if (error) return UI.toast(error.message);
    UI.toast("✔️ تم حفظ بيانات وليّ الأمر");
    await App.loadProfile();
  },

  async saveSettings(){
    const patch = {
      unit_glucose: this.val("g_unit"),     // "mg/dL" | "mmol/L"
      locale:       this.val("g_locale"),
      timezone:     this.val("g_timezone")
    };
    const { error } = await API.updateUserSettings(patch);
    if (error) return UI.toast(error.message);
    UI.toast("✔️ تم حفظ الإعدادات");
    await App.loadUserSettings();
  },

  // ------ Add Child with settings ------
  async addChild(){
    const name = this.val("child_name").trim();
    const unit = this.val("child_unit") || (App.userSettings?.unit_glucose || "mg/dL");
    if (!name) { UI.toast("اكتبي اسم الطفل"); return; }

    // 1) إنشاء الطفل
    const { data: ch, error } = await API.addChild({ display_name: name });
    if (error){ UI.toast(error.message); return; }

    // 2) child_settings بالوحدة المختارة
    const { error: err2 } = await API.initChildSettings(ch.id, unit);
    if (err2){ UI.toast("تم إنشاء الطفل (تعذّر حفظ إعداداته، يمكن ضبطها لاحقًا)"); }
    else { UI.toast("✔️ تم إنشاء الطفل وإعداداته"); }

    // 3) تحديث القائمة
    document.getElementById("child_name").value = "";
    const sel = document.getElementById("child_unit"); if (sel) sel.value = unit;
    Children.load();
  }
};

document.addEventListener("DOMContentLoaded", ()=>Guardian.init());
