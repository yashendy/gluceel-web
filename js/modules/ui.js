
window.UI={
  toast(msg){ const t=document.getElementById('toast'); if(!t)return; t.textContent=msg; t.className='toast card show'; setTimeout(()=>t.className='toast card',2500); },
  togglePass(id){ const el=document.getElementById(id); if(!el)return; el.type= el.type==='password'?'text':'password'; },
  showAuthTab(tab){ const L=document.getElementById('authLogin'), S=document.getElementById('authSignup'); if(!L||!S)return; L.style.display= tab==='login'?'block':'none'; S.style.display= tab==='signup'?'block':'none'; if(tab==='signup'){ document.getElementById('doctorCodeRow')?.style.display='block'; } },
  renderUserMenu(){
    const wrap=document.getElementById('userMenu'); if(!wrap) return;
    wrap.innerHTML= App.session? `<a class="btn" href="${APP_CONFIG.BASE_PATH}pages/children.html">منطقتي</a><button class="btn ghost" onclick="Auth.logout()">خروج</button>` : `<a class="btn" href="${APP_CONFIG.BASE_PATH}auth/login.html">دخول</a>`;
    const side=document.getElementById('sideNav'); if(side){ const role=App.profile?.role||'guardian'; let links=[];
      if(role==='guardian'){ links=[["children.html","الأطفال"],["dashboard.html","لوحة الطفل"],["measurements.html","القياسات"],["foods.html","الأطعمة"],["meals-builder.html","الوجبات"],["targets.html","الأهداف"],["labs.html","التحاليل"],["rewards.html","المكافآت"],["share.html","مشاركة الوصول"],["ai-chat.html","الشات الذكي"],["education.html","التوعية"],["help.html","المساعدة"],["emergency.html","الطوارئ"]]; }
      else { links=[["doctor-code.html","إدخال كود"],["doctor-children.html","أطفالي"],["doctor-child.html","لوحة طفل"],["ai-chat.html","الشات الذكي"],["education.html","التوعية"],["help.html","المساعدة"]]; }
      side.innerHTML = links.map(([p,t])=>`<a href="${APP_CONFIG.BASE_PATH}pages/${p}">${t}</a>`).join("");
    }
  }
};
