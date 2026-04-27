// canadian-config.js - 加拿大本地化配置
export const canadianConfig = {
  // 地理位置配置
  region: {
    name: 'GTA',
    fullName: 'Greater Toronto Area',
    country: 'Canada',
    provinces: ['ON', 'QC', 'BC', 'AB'], // 主要省份代码
    currency: {
      code: 'CAD',
      symbol: 'CA$',
      name: 'Canadian Dollar'
    }
  },
  
  // 联系方式配置
  contact: {
    supportPhone: '+1 (416) 582-9301',
    customerServiceHours: '周一至周日 9:00AM - 8:00PM EST',
    email: 'support@sunnynow.ca'
  },
  
  // 日期时间配置
  datetime: {
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm A',
    timezone: 'America/Toronto'
  },
  
  // 语言配置
  languages: ['zh-CN', 'en', 'fr'], // 支持中文、英文、法语
  
  // 通知模板
  notificationTemplates: {
    orderCreated: '您的订单已创建，订单号：{orderNumber}',
    orderReady: '您的订单已准备好，请于{pickupTime}到{location}自提',
    orderCompleted: '您的订单已完成，感谢使用SunnyNow服务！'
  },
  
  // 自提点配置
  pickupLocations: [
    {
      id: 'toronto-central',
      name: '多伦多中央自提点',
      address: '123 Main St, Toronto, ON M4C 5A9',
      hours: '周一至周日 10:00AM - 7:00PM'
    },
    {
      id: 'scarborough-east',
      name: '士嘉堡东自提点',
      address: '456 East Gate Blvd, Scarborough, ON M1B 2R5',
      hours: '周二至周六 11:00AM - 8:00PM'
    }
  ]
};

// 工具函数
export const canadianUtils = {
  // 格式化加拿大手机号
  formatCanadianPhone(phone) {
    if (!phone) return '';
    // 移除所有非数字字符
    const digits = phone.replace(/\D/g, '');
    // 如果是11位且以1开头，去掉国家代码
    let localDigits = digits;
    if (digits.length === 11 && digits.startsWith('1')) {
      localDigits = digits.substring(1);
    }
    // 格式化为 (XXX) XXX-XXXX
    if (localDigits.length === 10) {
      return `(${localDigits.substring(0, 3)}) ${localDigits.substring(3, 6)}-${localDigits.substring(6)}`;
    }
    return phone;
  },

  // 验证加拿大邮政编码格式
  validatePostalCode(postalCode) {
    const regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return regex.test(postalCode);
  },

  // 获取当前时区时间
  getCurrentTime() {
    return new Date().toLocaleString('en-CA', {
      timeZone: canadianConfig.datetime.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
};

export default canadianConfig;