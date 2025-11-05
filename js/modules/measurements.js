window.Measurements = {
  childId(){
    const p = new URLSearchParams(location.search);
    return p.get('child') || localStorage.getItem('active_child_id');
  },

  async load(){
    const child = this.childId();
    if (!child) return;

    // اضبط وحدة الطفل الفعّالة
    App.childUnitOverride = await API.getEffectiveUnit(child);

    const tbody = document.querySelector('#mTable tbody');
    if (!tbody) return;
    const { data, error } = await API.listMeasurements(child, 200);
    if (error){ tbody.innerHTML = `<tr><td colspan="3">${error.message}</td></tr>`; return; }

    const unit = Units.label();
    tbody.innerHTML = (data || []).map(r => `
      <tr>
        <td>${new Date(r.observed_at || r.at).toLocaleString()}</td>
        <td>${Units.toDisplay(r.glucose_mgdl || r.value)} ${unit}</td>
        <td>${r.context || ''}</td>
      </tr>
    `).join('');
    const unitSpan = document.getElementById('mUnit');
    if (unitSpan) unitSpan.textContent = unit;
  },

  async add(){
    const child = this.childId();
    if (!child){ UI.toast('اختاري طفلًا أولًا'); return; }
    const raw = document.getElementById('mValue').value;
    const ctx  = document.getElementById('mCtx').value;
    const { error } = await API.addMeasurement(child, raw, ctx);
    if (error){ UI.toast(error.message); return; }
    UI.toast('تم الحفظ'); this.load();
  }
};
document.addEventListener('DOMContentLoaded',()=>Measurements.load());
