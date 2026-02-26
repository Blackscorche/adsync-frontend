// System-wide constants
export const CURRENCY = {
  symbol: '£',
  code: 'GBP',
  name: 'British Pound',
}

// You can easily change the currency here
// For example, to use USD:
// export const CURRENCY = {
//   symbol: '$',
//   code: 'USD',
//   name: 'US Dollar'
// };

export const formatCurrency = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(value) || value === null || value === undefined) {
    return `${CURRENCY.symbol}0.00`
  }
  return `${CURRENCY.symbol}${value.toFixed(2)}`
}

export const SUBSCRIPTION_STATUS = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  SALES: 'sales',
  DESIGN: 'design',
  OWNER: 'owner',
} as const

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
  { value: 'other', label: 'Other' },
] as const

// Promotion Types
export const PROMOTION_TYPES = [
  { value: '1', label: 'Go Local' },
  { value: '2', label: 'Go Local Extra' },
  { value: '3', label: 'Premier' },
  { value: '4', label: 'Family Shopper' },
  { value: '5', label: 'Best One' },
  { value: '6', label: 'One Stop' },
  { value: '7', label: 'Independent' },
] as const

// Display Fixed At
export const DISPLAY_FIXED_AT = [
  { value: '1', label: 'On the Floor' },
  { value: '2', label: 'Ceiling' },
]

// Wifi Connection
export const WIFI_CONNECTION = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
]

// Cable Support
export const CABLE_SUPPORT = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
]

export type ShopType = (typeof SHOP_TYPES)[number]['value']
