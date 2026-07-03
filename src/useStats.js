import { useStore } from './store.jsx'

export function useStats() {
  const { state } = useStore()
  const today = new Date().toDateString()
  const todayTxns = (state.transactions || []).filter(
    t => new Date(t.time).toDateString() === today
  )
  const fixedProducts = (state.products || []).filter(p => !p.type || p.type === 'fixed')
  return {
    todaySales: todayTxns.reduce((sum, t) => sum + t.total, 0),
    todayProfit: todayTxns.reduce((sum, t) => sum + t.profit, 0),
    totalStock: fixedProducts.reduce((sum, p) => sum + (p.qty || 0), 0),
    totalDebt: (state.customers || []).reduce((sum, c) => sum + c.totalBalance, 0),
    lowStockCount: fixedProducts.filter(p => p.qty <= p.low).length,
    cartCount: (state.orders || []).reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0),
    orderCount: (state.orders || []).filter(o => o.items.length > 0).length,
    todayCount: todayTxns.length,
  }
}
