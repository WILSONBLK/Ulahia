import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money, filterByPeriod } from '../utils.js'

export const EXPENSE_CATEGORIES = ['transport', 'rent', 'salary', 'fuel', 'utilities', 'other']

function categoryLabelKey(category) {
  return 'expenseCategory' + category.charAt(0).toUpperCase() + category.slice(1)
}

function ExpenseFormModal() {
  const { dispatch } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()

  function handleSubmit(e) {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    const amount = Number(d.get('amount'))
    if (!amount || amount <= 0) return
    const category = d.get('category')
    const note = d.get('note').trim()
    dispatch({ type: 'ADD_EXPENSE', payload: { category, amount, note } })
    showToast(t('expenseRecordedToast', { amount: money(amount) }))
    closeModal()
  }

  return (
    <>
      <h3>{t('addExpense')}</h3>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="label wide">
          {t('expenseCategory')}
          <select className="field" name="category" defaultValue={EXPENSE_CATEGORIES[0]}>
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c} value={c}>{t(categoryLabelKey(c))}</option>
            ))}
          </select>
        </label>
        <label className="label">
          {t('amount')}
          <input className="field" name="amount" type="number" min="1" placeholder="1200" required autoFocus />
        </label>
        <label className="label">
          {t('note')} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({t('optional')})</span>
          <input className="field" name="note" placeholder={t('notePlaceholderExpense')} />
        </label>
        <div className="row wide">
          <button className="button" type="submit">{t('save')}</button>
          <button className="button light" type="button" onClick={closeModal}>{t('cancel')}</button>
        </div>
      </form>
    </>
  )
}

function WithdrawalFormModal() {
  const { dispatch } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()

  function handleSubmit(e) {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    const amount = Number(d.get('amount'))
    if (!amount || amount <= 0) return
    const note = d.get('note').trim()
    dispatch({ type: 'ADD_WITHDRAWAL', payload: { amount, note } })
    showToast(t('withdrawalRecordedToast', { amount: money(amount) }))
    closeModal()
  }

  return (
    <>
      <h3>{t('addWithdrawal')}</h3>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="label wide">
          {t('amount')}
          <input className="field" name="amount" type="number" min="1" placeholder={t('amountPlaceholderWithdrawal')} required autoFocus />
        </label>
        <label className="label wide">
          {t('note')} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({t('optional')})</span>
          <input className="field" name="note" placeholder={t('notePlaceholderWithdrawal')} />
        </label>
        <div className="row wide">
          <button className="button" type="submit">{t('save')}</button>
          <button className="button light" type="button" onClick={closeModal}>{t('cancel')}</button>
        </div>
      </form>
    </>
  )
}

export default function Expenses() {
  const { state, dispatch } = useStore()
  const t = useLang()
  const { openModal } = useModal()
  const showToast = useToast()
  const [tab, setTab] = useState('expenses')
  const [period, setPeriod] = useState('today')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const records = tab === 'expenses' ? state.expenses : state.withdrawals
  const filtered = filterByPeriod(records, period)
  const total = filtered.reduce((s, r) => s + r.amount, 0)

  const tabStyle = active => ({
    flex: 1,
    minHeight: 40,
    border: '1px solid var(--line)',
    borderRadius: 8,
    background: active ? 'var(--green)' : 'white',
    color: active ? 'white' : 'var(--ink)',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
  })

  const PERIODS = [
    { key: 'today', label: t('today') },
    { key: 'week', label: t('thisWeek') },
    { key: 'month', label: t('thisMonth') },
    { key: 'all', label: t('allTime') },
  ]

  function deleteExpense(exp) {
    dispatch({ type: 'DELETE_EXPENSE', payload: exp.id })
    setConfirmDeleteId(null)
    showToast(t('expenseRemovedToast'), { undo: () => dispatch({ type: 'RESTORE_EXPENSE', payload: exp }) })
  }

  function deleteWithdrawal(w) {
    dispatch({ type: 'DELETE_WITHDRAWAL', payload: w.id })
    setConfirmDeleteId(null)
    showToast(t('withdrawalRemovedToast'), { undo: () => dispatch({ type: 'RESTORE_WITHDRAWAL', payload: w }) })
  }

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="section-kicker">{tab === 'expenses' ? t('expenses') : t('withdrawals')}</span>
          <h2>{money(total)}</h2>
        </div>
        <button
          className="button"
          onClick={() => openModal(tab === 'expenses' ? <ExpenseFormModal /> : <WithdrawalFormModal />)}
        >
          {tab === 'expenses' ? t('addExpense') : t('addWithdrawal')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button style={tabStyle(tab === 'expenses')} onClick={() => setTab('expenses')}>{t('expenses')}</button>
        <button style={tabStyle(tab === 'withdrawals')} onClick={() => setTab('withdrawals')}>{t('withdrawals')}</button>
      </div>

      <div className="report-periods">
        {PERIODS.map(p => (
          <button
            key={p.key}
            className={`period-tab${period === p.key ? ' is-active' : ''}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="list" style={{ marginTop: 14 }}>
        {!filtered.length ? (
          <div className="empty">{tab === 'expenses' ? t('noExpenses') : t('noWithdrawals')}</div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="expense-row">
              <div className="expense-info">
                {tab === 'expenses' && <span className="pill">{t(categoryLabelKey(r.category))}</span>}
                {r.note && <strong>{r.note}</strong>}
                <span className="expense-meta">
                  {new Date(r.time).toLocaleString('en-NG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{money(r.amount)}</strong>
                {confirmDeleteId === r.id
                  ? (
                    <button
                      className="button"
                      style={{ minHeight: 34, padding: '0 10px', fontSize: '0.85rem', background: 'var(--red)' }}
                      onClick={() => (tab === 'expenses' ? deleteExpense(r) : deleteWithdrawal(r))}
                    >
                      {t('sureBtn')}
                    </button>
                  )
                  : (
                    <button
                      className="button light"
                      style={{ minHeight: 34, padding: '0 10px', fontSize: '0.85rem', color: 'var(--red)' }}
                      onClick={() => setConfirmDeleteId(r.id)}
                    >
                      {t('deleteProduct')}
                    </button>
                  )
                }
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
