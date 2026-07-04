// Product categories — used by the New Sale filter chips and the product forms.
// Stored on each product as `category` (one of these ids, or '' for uncategorised).
export const CATEGORIES = [
  { id: 'drinks',       key: 'catDrinks' },
  { id: 'snacks',       key: 'catSnacks' },
  { id: 'food',         key: 'catFood' },
  { id: 'household',    key: 'catHousehold' },
  { id: 'personalCare', key: 'catPersonalCare' },
  { id: 'others',       key: 'catOthers' },
]

export const CATEGORY_KEY = Object.fromEntries(CATEGORIES.map(c => [c.id, c.key]))
