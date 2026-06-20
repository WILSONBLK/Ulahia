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
    cartCount: (state.cart || []).reduce((sum, i) => sum + i.qty, 0),
    todayCount: todayTxns.length,
  }
}
