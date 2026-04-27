import zhCN from '../locales/zh-CN.js';

// 简单的国际化实现（可根据需要扩展为完整i18n库）
const translations = {
  'zh-CN': zhCN
};

let currentLocale = 'zh-CN';

export const setLocale = (locale) => {
  if (translations[locale]) {
    currentLocale = locale;
  }
};

export const t = (key, params = {}) => {
  const keys = key.split('.');
  let value = translations[currentLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // 如果找不到翻译，返回原始键
    }
  }
  
  // 简单的参数替换
  if (typeof value === 'string') {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replace(`{${paramKey}}`, paramValue);
    }
  }
  
  return value;
};

// 导出当前语言环境的翻译对象，便于直接访问
export const locale = () => translations[currentLocale];