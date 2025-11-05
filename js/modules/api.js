window.API = {
  sb(){ return App.supabase; },
  tables: APP_CONFIG.TABLES, cols: APP_CONFIG.COLUMNS,

  async listChildren(){
    const t=this.tables.children, c=this.cols.children;
    return await this.sb().from(t).select(`${c.id}, ${c.name}`).order(c.name); // ← من غير unit
  },

  async addChild(payload){
    const t=this.tables.children;
    return await this.sb().from(t).insert(payload).select().single();
  },

  async listMeasurements(childId,limit=100){
    const t=this.tables.measurements, c=this.cols.measurements;
    return await this.sb().from(t)
      .select(`${c.id}, ${c.value}, ${c.context}, ${c.at}`)
      .eq(c.child_id,childId).order(c.at,{ascending:false}).limit(limit);
  },

  async addMeasurement(childId,value,context){
    const t=this.tables.measurements, c=this.cols.measurements;
    const row={}; row[c.child_id]=childId; row[c.value]=value; row[c.context]=context; row[c.at]=new Date().toISOString();
    return await this.sb().from(t).insert(row).select().single();
  },

  async getTargets(childId){
    const c=this.cols.targets;
    return await this.sb().from('v_child_current_targets')
      .select(`${c.child_id}, ${c.low} as low, ${c.high} as high`)
      .eq(c.child_id,childId).maybeSingle();
  },

  async getSummary(childId){
    return await this.sb().from('v_child_summary_rolling').select('*').eq('child_id',childId).order('period_days');
  }
};
