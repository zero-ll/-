// 国家代码到国家名称的映射
export const COUNTRY_MAP: Record<string, string> = {
  'US': '美国',
  'GB': '英国',
  'UK': '英国',
  'CA': '加拿大',
  'AU': '澳大利亚',
  'DE': '德国',
  'FR': '法国',
  'IT': '意大利',
  'ES': '西班牙',
  'NL': '荷兰',
  'SE': '瑞典',
  'NO': '挪威',
  'DK': '丹麦',
  'FI': '芬兰',
  'BE': '比利时',
  'AT': '奥地利',
  'CH': '瑞士',
  'IE': '爱尔兰',
  'PL': '波兰',
  'CZ': '捷克',
  'JP': '日本',
  'KR': '韩国',
  'CN': '中国',
  'IN': '印度',
  'SG': '新加坡',
  'MY': '马来西亚',
  'TH': '泰国',
  'VN': '越南',
  'PH': '菲律宾',
  'ID': '印度尼西亚',
  'NZ': '新西兰',
  'BR': '巴西',
  'MX': '墨西哥',
  'AR': '阿根廷',
  'CL': '智利',
  'CO': '哥伦比亚',
};

// 获取国家名称，如果没有映射则返回原代码
export const getCountryName = (code: string): string => {
  return COUNTRY_MAP[code] || code;
};
