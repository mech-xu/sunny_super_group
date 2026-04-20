// canadian-utils.js - 加拿大专用工具函数
// 包含加拿大邮编验证、省份列表等功能

// 加拿大省份列表
const canadianProvinces = [
  { code: 'ON', name: '安大略省', name_en: 'Ontario' },
  { code: 'QC', name: '魁北克省', name_en: 'Quebec' },
  { code: 'BC', name: '不列颠哥伦比亚省', name_en: 'British Columbia' },
  { code: 'AB', name: '阿尔伯塔省', name_en: 'Alberta' },
  { code: 'MB', name: '马尼托巴省', name_en: 'Manitoba' },
  { code: 'SK', name: '萨斯喀彻温省', name_en: 'Saskatchewan' },
  { code: 'NS', name: '新斯科舍省', name_en: 'Nova Scotia' },
  { code: 'NB', name: '新不伦瑞克省', name_en: 'New Brunswick' },
  { code: 'NL', name: '纽芬兰与拉布拉多省', name_en: 'Newfoundland and Labrador' },
  { code: 'PE', name: '爱德华王子岛省', name_en: 'Prince Edward Island' },
  { code: 'NT', name: '西北地区', name_en: 'Northwest Territories' },
  { code: 'YT', name: '育空地区', name_en: 'Yukon' },
  { code: 'NU', name: '努纳武特地区', name_en: 'Nunavut' }
];

// 加拿大邮编验证正则表达式
const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

/**
 * 验证加拿大邮编
 * @param {string} postalCode - 邮编
 * @returns {boolean} - 是否为有效的加拿大邮编
 */
const validateCanadianPostalCode = (postalCode) => {
  if (!postalCode) return false;
  return canadianPostalCodeRegex.test(postalCode.toUpperCase());
};

/**
 * 格式化加拿大邮编（添加空格）
 * @param {string} postalCode - 邮编
 * @returns {string} - 格式化后的邮编
 */
const formatCanadianPostalCode = (postalCode) => {
  if (!postalCode) return '';
  
  // 移除所有空格和特殊字符，只保留字母和数字
  const cleaned = postalCode.replace(/[^A-Za-z0-9]/g, '');
  
  // 如果长度为6，添加空格
  if (cleaned.length === 6) {
    return cleaned.substring(0, 3) + ' ' + cleaned.substring(3, 6);
  }
  
  return cleaned;
};

/**
 * 获取省份列表
 * @param {string} lang - 语言 ('zh' 或 'en')
 * @returns {Array} - 省份列表
 */
const getProvinces = (lang = 'zh') => {
  return canadianProvinces.map(province => ({
    code: province.code,
    name: lang === 'en' ? province.name_en : province.name
  }));
};

/**
 * 根据邮编获取大概的省份
 * 注意：这里只是简单实现，实际应用中可能需要更精确的地理位置服务
 * @param {string} postalCode - 邮编
 * @returns {string|null} - 省份代码
 */
const getProvinceByPostalCode = (postalCode) => {
  if (!postalCode) return null;
  
  const code = postalCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length === 0) return null;
  
  const firstChar = code.charAt(0);
  
  // 根据邮编首字母判断省份
  switch (firstChar) {
    case 'A':
      return 'NL'; // 纽芬兰与拉布拉多省
    case 'B':
      return 'NS'; // 新斯科舍省
    case 'C':
      return 'PE'; // 爱德华王子岛省
    case 'E':
      return 'NB'; // 新不伦瑞克省
    case 'G':
    case 'H':
    case 'J':
      return 'QC'; // 魁北克省
    case 'K':
    case 'L':
    case 'M':
    case 'N':
    case 'P':
      return 'ON'; // 安大略省
    case 'R':
      return 'MB'; // 马尼托巴省
    case 'S':
      return 'SK'; // 萨斯喀彻温省
    case 'T':
      return 'AB'; // 阿尔伯塔省
    case 'V':
      return 'BC'; // 不列颠哥伦比亚省
    case 'X':
      return 'NT'; // 西北地区 或 努纳武特地区
    case 'Y':
      return 'YT'; // 育空地区
    default:
      return null;
  }
};

/**
 * 获取距离（单位：公里）
 * 使用 Haversine 公式计算两点之间的距离
 * @param {number} lat1 - 点1纬度
 * @param {number} lon1 - 点1经度
 * @param {number} lat2 - 点2纬度
 * @param {number} lon2 - 点2经度
 * @returns {number} - 距离（公里）
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径（公里）
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // 距离（公里）
  return Math.round(distance * 100) / 100;
};

/**
 * 角度转弧度
 * @param {number} deg - 角度
 * @returns {number} - 弧度
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * 获取最近的自提点
 * @param {number} userLat - 用户纬度
 * @param {number} userLon - 用户经度
 * @param {Array} pickupPoints - 自提点列表
 * @returns {Object} - 最近的自提点
 */
const getNearestPickupPoint = (userLat, userLon, pickupPoints) => {
  if (!pickupPoints || pickupPoints.length === 0) return null;
  
  let nearest = null;
  let minDistance = Infinity;
  
  for (const point of pickupPoints) {
    const distance = calculateDistance(userLat, userLon, point.latitude, point.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...point, distance };
    }
  }
  
  return nearest;
};

export default {
  canadianProvinces,
  validateCanadianPostalCode,
  formatCanadianPostalCode,
  getProvinces,
  getProvinceByPostalCode,
  calculateDistance,
  getNearestPickupPoint
};