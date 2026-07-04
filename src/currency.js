// ── Currency system ──────────────────────────────────────────────────────────
// The app is offline-first and now serves users beyond Nigeria (international
// login/signup), so money formatting is driven by the shop's chosen currency.
// money() reads a module-level active currency so the ~16 existing call sites
// don't each need the currency threaded through them; the store keeps it in sync
// with shop.currency on load and on every change.

export const CURRENCIES = [
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira',      locale: 'en-NG', decimals: 0 },
  { code: 'GHS', symbol: 'GH₵',  name: 'Ghanaian Cedi',       locale: 'en-GH', decimals: 2 },
  { code: 'XOF', symbol: 'CFA',  name: 'West African CFA',     locale: 'fr-SN', decimals: 0 },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA',  locale: 'fr-CM', decimals: 0 },
  { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling',      locale: 'en-KE', decimals: 0 },
  { code: 'TZS', symbol: 'TSh',  name: 'Tanzanian Shilling',   locale: 'en-TZ', decimals: 0 },
  { code: 'UGX', symbol: 'USh',  name: 'Ugandan Shilling',     locale: 'en-UG', decimals: 0 },
  { code: 'RWF', symbol: 'FRw',  name: 'Rwandan Franc',        locale: 'en-RW', decimals: 0 },
  { code: 'ETB', symbol: 'Br',   name: 'Ethiopian Birr',       locale: 'en-ET', decimals: 2 },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand',   locale: 'en-ZA', decimals: 2 },
  { code: 'EGP', symbol: 'E£',   name: 'Egyptian Pound',       locale: 'en-EG', decimals: 2 },
  { code: 'MAD', symbol: 'DH',   name: 'Moroccan Dirham',      locale: 'fr-MA', decimals: 2 },
  { code: 'SLL', symbol: 'Le',   name: 'Sierra Leonean Leone', locale: 'en-SL', decimals: 0 },
  { code: 'LRD', symbol: 'L$',   name: 'Liberian Dollar',      locale: 'en-LR', decimals: 0 },
  { code: 'GMD', symbol: 'D',    name: 'Gambian Dalasi',       locale: 'en-GM', decimals: 2 },
  { code: 'GBP', symbol: '£',    name: 'British Pound',        locale: 'en-GB', decimals: 2 },
  { code: 'USD', symbol: '$',    name: 'US Dollar',            locale: 'en-US', decimals: 2 },
  { code: 'CAD', symbol: 'C$',   name: 'Canadian Dollar',      locale: 'en-CA', decimals: 2 },
  { code: 'EUR', symbol: '€',    name: 'Euro',                 locale: 'en-IE', decimals: 2 },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real',       locale: 'pt-BR', decimals: 2 },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee',         locale: 'en-IN', decimals: 2 },
  { code: 'CNY', symbol: '¥',    name: 'Chinese Yuan',         locale: 'zh-CN', decimals: 2 },
  { code: 'AED', symbol: 'AED',  name: 'UAE Dirham',           locale: 'en-AE', decimals: 2 },
  { code: 'SAR', symbol: 'SAR',  name: 'Saudi Riyal',          locale: 'en-SA', decimals: 2 },
]

const BY_CODE = Object.fromEntries(CURRENCIES.map(c => [c.code, c]))

// ISO country code → default currency (mirrors DialCodePicker's country list)
export const COUNTRY_CURRENCY = {
  NG: 'NGN', GH: 'GHS', BJ: 'XOF', TG: 'XOF', CM: 'XAF', NE: 'XOF', CI: 'XOF',
  SN: 'XOF', SL: 'SLL', LR: 'LRD', GM: 'GMD', KE: 'KES', TZ: 'TZS', UG: 'UGX',
  RW: 'RWF', ET: 'ETB', ZA: 'ZAR', EG: 'EGP', MA: 'MAD', GB: 'GBP', US: 'USD',
  CA: 'CAD', FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', BR: 'BRL',
  IN: 'INR', CN: 'CNY', AE: 'AED', SA: 'SAR',
}

export const DEFAULT_CURRENCY = 'NGN'

export function getCurrency(code) {
  return BY_CODE[code] || BY_CODE[DEFAULT_CURRENCY]
}

export function currencyForCountry(countryCode) {
  return COUNTRY_CURRENCY[countryCode] || DEFAULT_CURRENCY
}

// Module-level active currency, kept in sync by the store.
let _active = getCurrency(DEFAULT_CURRENCY)

export function setActiveCurrency(code) {
  _active = getCurrency(code)
}

export function activeCurrency() {
  return _active
}

// Format a numeric amount in the active currency. Whole-number currencies
// (Naira, shillings…) show no decimals; others show 2 unless the amount is whole.
export function formatMoney(value, currencyCode) {
  const c = currencyCode ? getCurrency(currencyCode) : _active
  const n = Number(value || 0)
  const hasFraction = Math.abs(n % 1) > 0.005
  const digits = c.decimals === 0 ? 0 : (hasFraction ? 2 : 0)
  const num = n.toLocaleString(c.locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return `${c.symbol}${num}`
}
