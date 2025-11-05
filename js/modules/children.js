window.Children = {
  async load(){
    const list = document.getElementById('childrenList');
    if (!list) return;
    const { data, error } = await API.listChildren();
    if (error){ list.innerHTML = `<div class='alert'>${error.message}</div>`; return; }
    if (!data || data.length===0){
      list.innerHTML = `<div class='alert'>لا يوجد أطفال بعد. اضغطي "إضافة طفل".</div>`;
      return;
    }
    list.innerHTML = data.map(ch => `
      <div class='card inline' style='justify-content:space-between'>
        <div>
          <strong>${ch.display_name || ch.name || 'طفل'}</strong>
          <div class='small'>الوحدة: mg/dL</div>
        </div>
        <div class='inline'>
          <a class='btn' href='${APP_CONFIG.BASE_PATH}pages/dashboard.html?child=${ch.id}'>عرض</a>
        </div>
      </div>
    `).join('');
  },

  addDialog(){
    const name = prompt('اسم الطفل');
    if (!name) return;
    API.addChild({ display_name: name })
      .then(({error})=>{
        if (error) return UI.toast(error.message);
        UI.toast('تمت إضافة الطفل'); location.reload();
      });
  }
};
document.addEventListener('DOMContentLoaded',()=>Children.load());
