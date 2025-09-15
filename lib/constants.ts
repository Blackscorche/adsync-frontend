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

// Shop Types - Keep consistent across all forms
export const SHOP_TYPES = [
  { value: 'retail', label: 'Retail Store' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'coffee_shop', label: 'Coffee Shop' },
  { value: 'salon', label: 'Hair/Beauty Salon' },
  { value: 'gym', label: 'Gym/Fitness' },
  { value: 'medical', label: 'Medical/Dental' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'bar', label: 'Bar/Pub' },
  { value: 'hotel', label: 'Hotel/Accommodation' },
  { value: 'other', label: 'Other' }
] as const;

export type ShopType = typeof SHOP_TYPES[number]['value'];