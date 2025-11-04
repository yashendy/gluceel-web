// تسجيل Service Worker لتمكين الـPWA والأوفلاين
(function(){
  if('serviceWorker' in navigator){
    const sw = APP_CONFIG.BASE_PATH + 'sw.js';
    navigator.serviceWorker.register(sw).catch(()=>{});
  }
})();
