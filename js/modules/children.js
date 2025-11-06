window.Children = {
  async load(){
    const list = document.getElementById('childrenList');
    if (!list) return;
    const { data, error } = await API.listChildren();
    if (error){
      list.innerHTML = `<div class='alert'>${error.message}</div>`;
      return;
    }
    if (!data || data.length===0){
      list.innerHTML = `<div class='alert'>لا يوجد أطفال بعد. اضغطي "إضافة طفل".</div>`;
      return;
    }
    const unitLabel = Units.label();
    list.innerHTML = data.map(ch => `
      <div class='card inline' style='justify-content:space-between'>
        <div>
          <strong>${ch.display_name || ch.name || 'طفل'}</strong>
          <div class='small'>الوحدة: ${unitLabel}</div>
        </div>
        <div class='inline'>
          <a class='btn' href='${APP_CONFIG.BASE_PATH}pages/dashboard.html?child=${ch.id}'>عرض</a>
        </div>
      </div>
    `).join('');
  }
};
document.addEventListener('DOMContentLoaded',()=>Children.load());
