// /js/modules/api.js  — نسخة متوافقة (بدون async shorthand) + RPC create_child
(function(){
  if (!window.APP_CONFIG) { console.error("APP_CONFIG missing"); return; }

  window.API = {
    sb: function(){ return App.supabase; },
    tables: APP_CONFIG.TABLES,
    cols: APP_CONFIG.COLUMNS,

    // -------- Profiles --------
    getOwnProfile: async function () {
      const p = this.cols.profiles || {};
      const cols = [
        p.role, p.full_name, p.phone, p.avatar_url,
        p.onboarding_complete, p.default_child_id,
        p.emergency_contact_name, p.emergency_contact_phone
      ].filter(Boolean).join(",");
      return await this.sb().from(this.tables.profiles).select(cols).eq(p.user_id, App.session.user.id).maybeSingle();
    },

    updateOwnProfile: async function (patch) {
      const p = this.cols.profiles || {};
      patch[p.user_id] = App.session.user.id;
      return await this.sb().from(this.tables.profiles).upsert(patch, { onConflict: p.user_id }).select().maybeSingle();
    },

    // -------- User Settings --------
    getUserSettings: async function(){
      return await this.sb().from(this.tables.user_settings || "user_settings")
        .select("*").eq("user_id", App.session.user.id).maybeSingle();
    },

    // fallback (UPDATE ثم INSERT) لتجنّب onConflict على عمود غير مميز
    updateUserSettings: async function(patch){
      const table = this.tables.user_settings || "user_settings";
      const uid = App.session.user.id;
      patch.user_id = uid;

      const upd = await this.sb().from(table).update(patch).eq("user_id", uid).select().maybeSingle();
      if (!upd.error && (upd.data || upd.status === 204)) {
        return { data: upd.data || { user_id: uid }, error: null };
      }
      const ins = await this.sb().from(table).insert(patch).select().maybeSingle();
      return { data: ins.data, error: ins.error || null };
    },

    // -------- Children --------
    listChildren: async function(){
      // نحاول الحقول الشائعة
      return await this.sb().from(this.tables.children)
        .select("id, display_name, name")
        .order("display_name", { ascending: true });
    },

    // استدعاء RPC بدل INSERT مباشرة (يتخطى RLS بأمان)
    addChild: async function(payload){
      const name = (payload && (payload.display_name || payload.name)) || "";
      const unit = document.getElementById("child_unit")?.value
                || (App.userSettings && App.userSettings.unit_glucose) || "mg/dL";
      return await this.sb().rpc("create_child", {
        p_display_name: name,
        p_unit_display: unit
      });
    },

    // اختياري: ضبط/قراءة وحدة الطفل الفعّالة
    initChildSettings: async function(childId, displayUnit){
      const unit = displayUnit === "mmol/L" ? "mmol" : "mgdl";
      const up = await this.sb().from("child_settings").update({ glucose_unit: unit })
        .eq("child_id", childId).select().maybeSingle();
      if (!up.error && up.data) return { error: null };
      const ins = await this.sb().from("child_settings").insert({ child_id: childId, glucose_unit: unit })
        .select().maybeSingle();
      return { error: ins.error || null };
    },

    getEffectiveUnit: async function(childId){
      try{
        const { data } = await this.sb().from("v_child_effective_unit")
          .select("glucose_unit").eq("user_id", App.session.user.id).eq("child_id", childId).maybeSingle();
        if (data && data.glucose_unit) return (data.glucose_unit === "mmol" ? "mmol/L" : "mg/dL");
      }catch(e){}
      return (App.userSettings && App.userSettings.unit_glucose) || "mg/dL";
    },

    // -------- Measurements --------
    listMeasurements: async function(childId, limit){
      const lim = Number(limit || 100);
      return await this.sb().from(this.tables.measurements)
        .select("id, child_id, glucose_mgdl, context, observed_at, value")
        .eq("child_id", childId).order("observed_at", { ascending: false }).limit(lim);
    },

    addMeasurement: async function(childId, inputValue, context){
      const val = Units.toMgdl(inputValue);
      const row = {
        child_id: childId,
        glucose_mgdl: val,
        context: context || null,
        observed_at: new Date().toISOString()
      };
      return await this.sb().from(this.tables.measurements).insert(row).select().single();
    },

    // -------- Targets & Summary (Views) --------
    getTargets: async function(childId){
      return await this.sb().from("v_child_current_targets")
        .select("child_id, low_mgdl, high_mgdl").eq("child_id", childId).maybeSingle();
    },

    getSummary: async function(childId){
      return await this.sb().from("v_child_summary_rolling")
        .select("*").eq("child_id", childId).order("period_days");
    }
  };
})();
