
window.AI={history:[], model:null,
  init(){ const sel=document.getElementById('childSel'); if(sel){ sel.innerHTML='<option value="">اختاري طفل</option>'; } const st=document.getElementById('aiStatus'); if(st) st.textContent='تحميل النموذج المحلي…';
    const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.53/dist/index.min.js'; s.onload=()=>this.startModel(); s.onerror=()=>{ if(st) st.textContent='وضع خفيف: أسئلة عامة بدون نموذج.'; }; document.head.appendChild(s);
  },
  async startModel(){ try{ const st=document.getElementById('aiStatus'); const { CreateWebWorkerMLCEngine }=window.webllm; this.model=await CreateWebWorkerMLCEngine(new Worker('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.53/dist/worker.js',{type:'module'}),{model:'Qwen2.5-1.5B-Instruct-q4f16_1',temperature:0.6}); if(st) st.textContent='النموذج جاهز.'; }catch(e){ const st=document.getElementById('aiStatus'); if(st) st.textContent='تعذّر تحميل النموذج — وضع خفيف.'; } },
  clearChat(){ this.history=[]; document.getElementById('chatLog').innerHTML=''; },
  render(){ const log=document.getElementById('chatLog'); log.innerHTML=this.history.map(m=>`<div class='card'><div class='small'>${m.role==='user'?'أنتِ':'المساعد'}</div><div>${m.content}</div></div>`).join(''); },
  async send(){ const input=document.getElementById('chatInput'); const msg=input.value.trim(); if(!msg) return; input.value=''; this.history.push({role:'user',content:msg}); this.render();
    const useCtx=document.getElementById('useCtx')?.checked; let ctx=''; if(useCtx){ ctx='سياق الطفل: وحدة القياس، نطاق الأهداف، TIR 7/14/30، آخر 6 قراءات (وقت/قيمة)، وأحدث 3 وجبات.'; }
    const disclaimer='تنبيه طبي: هذه المعلومات تعليمية وليست نصيحة طبية. في الحالات الطارئة اتصلي بالطبيب فورًا.'; const prompt=`${disclaimer}\n${ctx}\nسؤال المستخدم: ${msg}`;
    let response='وضع خفيف: سأجيب إجابة عامة مبسطة.';
    try{ if(this.model){ const out=await this.model.chat.completions.create({messages:[...this.history,{role:'system',content:prompt}],temperature:0.6,max_tokens:256}); response=out.choices?.[0]?.message?.content||response; } }catch(e){}
    this.history.push({role:'assistant',content:response}); this.render();
  },
  exportChat(){ const blob=new Blob([JSON.stringify(this.history,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='ai-chat.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
};
document.addEventListener('DOMContentLoaded',()=>AI.init());
