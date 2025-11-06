window.API = {
  sb(){ return App.supabase; },
  tables: APP_CONFIG.TABLES, cols: APP_CONFIG.COLUMNS,

  // Profiles
  async getOwnProfile() {
    const p=this.cols.profiles;
    return await this.sb().from(this.tables.profiles)
      .select([p.role, p.full_name, p.phone, p.avatar_url, p.onboarding_complete,
               p.default_child_id, p.emergency_contact_name, p.emergency_contact_phone].join(","))
      .eq(p.user_id, App.session.user.id)
      .maybeSingle();
  },
  async updateOwnProfile(patch) {
    const p=this.cols.profiles;
    patch[p.user_id] = App.session.user.id;
    return await this.sb().from(this.tables.profiles)
      .upsert(patch, { onConflict: p.user_id })
      .select().maybeSingle();
  },

  // User Settings
  async getUserSettings(){
    return await this.sb().from(this.tables.user_settings || "user_settings")
      .select("*").eq("user_id", App.session.user.id).maybeSingle();
  },
  async updateUserSettings(patch){
    patch.user_id = App.session.user.id;
    return await this.sb().from(this.tables.user_settings || "user_settings")
      .upsert(patch, { onConflict: "user_id" }).select().maybeSingle();
  },

  // Children
  async listChildren(){
    const t=this.tables.children, c=this.cols.children;
    return await this.sb().from(t).select(`${c.id}, ${c.name}`).order(c.name);
  },
 async addChild(payload){
  const name = payload.display_name || payload.name;
  const unit = document.getElementById("child_unit")?.value
             || App.userSettings?.unit_glucose
             || "mg/dL";
  return await this.sb().rpc("create_child", {
    p_display_name: name,
    p_unit_display: unit
  });
}

  // child_settings: init/update آمن
  async initChildSettings(childId, displayUnit){
    const unit = Units.displayToChildUnit(displayUnit || Units.label()); // "mgdl"/"mmol"
    const upd = await this.sb().from("child_settings")
      .update({ glucose_unit: unit }).eq("child_id", childId).select().maybeSingle();
    if (!upd.error && upd.data) return { error: null };

    const ins = await this.sb().from("child_settings")
      .insert({ child_id: childId, glucose_unit: unit }).select().maybeSingle();
    return { error: ins.error || null };
  },

  // Effective unit via view (fallback -> user_settings)
  async getEffectiveUnit(childId){
    try{
      const { data } = await this.sb().from("v_child_effective_unit")
        .select("glucose_unit").eq("user_id", App.session.user.id).eq("child_id", childId).maybeSingle();
      if (data?.glucose_unit) return Units.childToDisplayUnit(data.glucose_unit);
    }catch(e){}
    return App.userSettings?.unit_glucose || "mg/dL";
  },

  // Measurements
  async listMeasurements(childId,limit=100){
    const t=this.tables.measurements, c=this.cols.measurements;
    return await this.sb().from(t)
      .select(`${c.id}, ${c.value}, ${c.context}, ${c.at}`)
      .eq(c.child_id,childId).order(c.at,{ascending:false}).limit(limit);
  },
  async addMeasurement(childId,inputValue,context){
    const t=this.tables.measurements, c=this.cols.measurements;
    const mgdl = Units.toMgdl(inputValue);
    const row={}; row[c.child_id]=childId; row[c.value]=mgdl; row[c.context]=context; row[c.at]=new Date().toISOString();
    return await this.sb().from(t).insert(row).select().single();
  },

  // Targets & Summary
  async getTargets(childId){
    const c=this.cols.targets;
    return await this.sb().from('v_child_current_targets')
      .select(`${c.child_id}, ${c.low} as low, ${c.high} as high`)
      .eq(c.child_id,childId).maybeSingle();
  },
  async getSummary(childId){
    return await this.sb().from('v_child_summary_rolling')
      .select('*').eq('child_id',childId).order('period_days');
  }
};
