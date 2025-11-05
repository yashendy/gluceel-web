window.Dashboard = {
  async load(){
    const p = new URLSearchParams(location.search);
    const childId = p.get('child');
    if (!childId) return;

    const { data: sum } = await API.getSummary(childId);
    const get = (d) => sum?.find(x => x.period_days === d);

    const e7   = document.getElementById('tir7');
    const e14  = document.getElementById('tir14');
    const e30  = document.getElementById('tir30');
    if (e7)  e7.innerText  = get(7)?.tir_pct  ?? '--';
    if (e14) e14.innerText = get(14)?.tir_pct ?? '--';
    if (e30) e30.innerText = get(30)?.tir_pct ?? '--';

    const { data: meas } = await API.listMeasurements(childId,1);
    const last = document.getElementById('lastG');
    if (last) last.innerText = meas?.[0]?.glucose_mgdl ?? '--';
  }
};
document.addEventListener('DOMContentLoaded',()=>Dashboard.load());
