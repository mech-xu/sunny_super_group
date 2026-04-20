import { createSSRApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import i18n from './utils/i18n';
import { http } from './utils/request';

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);

  // 初始化国际化
  const lang = uni.getStorageSync('language') || 'zh';
  i18n.setLanguage(lang);
  
  // 将国际化和请求实例挂载到全局
  app.config.globalProperties.$t = i18n.t;
  app.config.globalProperties.$http = http;
  app.config.globalProperties.$canadianUtils = import('./utils/canadian-utils.js');

  return {
    app,
    pinia
  };
}