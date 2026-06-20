import { useLang } from '../useLang.js'
import { useStats } from '../useStats.js'
import { money } from '../utils.js'

export default function StatCards() {
  const t = useLang()
  const { todaySales, todayProfit, totalStock, lowStockCount } = useStats()

  return (
    <div className="stats">
      <div className="stat">
        <span>{t('todaySales')}</span>
        <strong>{money(todaySales)}</strong>
      </div>
      <div className="stat">
        <span>{t('todayProfit')}</span>
        <strong className="amount good">{money(todayProfit)}</strong>
      </div>
      <div className="stat">
        <span>{t('stockLeft')}</span>
        <strong>{totalStock}</strong>
      </div>
      <div className={`stat${lowStockCount ? ' warn' : ''}`}>
        <span>{t('lowStock')}</span>
        <strong>{lowStockCount}</strong>
      </div>
    </div>
  )
}
