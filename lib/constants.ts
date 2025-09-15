// System-wide constants
export const CURRENCY = {
  symbol: '£',
  code: 'GBP',
  name: 'British Pound'
};

// You can easily change the currency here
// For example, to use USD:
// export const CURRENCY = {
//   symbol: '$',
//   code: 'USD',
//   name: 'US Dollar'
// };

export const formatCurrency = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${CURRENCY.symbol}${value.toFixed(2)}`;
};

export const SUBSCRIPTION_STATUS = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  SALES: 'sales',
  DESIGN: 'design',
  OWNER: 'owner'
} as const;