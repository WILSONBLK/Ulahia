import { useStore } from './store.jsx'
import { useOnline } from './useOnline.js'
import { useLang } from './useLang.js'
import { money } from './utils.js'

// Derives the live notification feed from data the app already tracks:
// out-of-stock / low-stock inventory, outstanding customer debts, and offline
// status. This is the data source for both the header bell badge and the
// Notifications screen — no separate store needed.
export function useNotifications() {
  const { state } = useStore()
  const online = useOnline()
  const t = useLang()

  const items = []
  const fixed = (state.products || []).filter(p => !p.type || p.type === 'fixed')
  const outOfStock = fixed.filter(p => (p.qty || 0) <= 0)
  const lowStock = fixed.filter(p => p.qty > 0 && p.qty <= p.low)
  const debtors = (state.customers || []).filter(c => c.totalBalance > 0)
  const totalDebt = debtors.reduce((s, c) => s + c.totalBalance, 0)

  if (outOfStock.length) {
    items.push({
      id: 'out-of-stock',
      tone: 'bad',
      icon: 'box',
      title: outOfStock.length === 1 ? t('notifOutOne') : t('notifOutMany', { n: outOfStock.length }),
      body: outOfStock.slice(0, 3).map(p => p.name).join(', ') + (outOfStock.length > 3 ? '…' : ''),
      view: 'products',
    })
  }
  if (lowStock.length) {
    items.push({
      id: 'low-stock',
      tone: 'warn',
      icon: 'box',
      title: lowStock.length === 1 ? t('notifLowOne') : t('notifLowMany', { n: lowStock.length }),
      body: lowStock.slice(0, 3).map(p => p.name).join(', ') + (lowStock.length > 3 ? '…' : ''),
      view: 'products',
    })
  }
  if (debtors.length) {
    items.push({
      id: 'debts',
      tone: 'warn',
      icon: 'debt',
      title: t('notifDebtTitle', { amount: money(totalDebt) }),
      body: debtors.length === 1 ? t('notifDebtOne') : t('notifDebtMany', { n: debtors.length }),
      view: 'debts',
    })
  }
  if (!online) {
    items.push({
      id: 'offline',
      tone: 'muted',
      icon: 'cloud',
      title: t('notifOfflineTitle'),
      body: t('notifOfflineBody'),
      view: null,
    })
  }

  return { items, count: items.length }
}
