// 业务规则配置
export const BUSINESS_RULES = {
  // 满减优惠配置
  discount: {
    enabled: true,
    threshold: 100, // 满多少金额
    amount: 10      // 减多少金额
  },
  
  // 支付方式配置
  paymentMethods: {
    pickup: '到店付款（自提时支付）'
  }
};

// 可以从环境变量或API动态加载这些配置
export const getBusinessRules = () => {
  // TODO: 未来可以从API获取动态配置
  return BUSINESS_RULES;
};