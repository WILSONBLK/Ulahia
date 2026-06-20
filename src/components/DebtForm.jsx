import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'

export default function DebtForm() {
  const { dispatch } = useStore()
  const t = useLang()
  const { closeModal } = useModal()
  const showToast = useToast()

  function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const debt = {
      name: data.get('name').trim(),
      phone: data.get('phone').trim(),
      amount: Number(data.get('amount')),
      reason: data.get('reason').trim(),
    }
    if (!debt.name || debt.amount <= 0) return
    dispatch({ type: 'ADD_DEBT', payload: debt })
    showToast(`${debt.name} added to owing book.`)
    closeModal()
  }

  return (
    <>
      <h3>{t('addDebt')}</h3>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="label">
          {t('customerName')}
          <input className="field" name="name" placeholder="e.g. Aunty Grace" required />
        </label>
        <label className="label">
          {t('phone')}
          <input className="field" name="phone" placeholder="0803 xxx xxxx" />
        </label>
        <label className="label">
          {t('amount')}
          <input className="field" name="amount" type="number" min="1" placeholder="1200" required />
        </label>
        <label className="label">
          {t('reason')}
          <input className="field" name="reason" placeholder="Rice and oil" />
        </label>
        <div className="row wide">
          <button className="button" type="submit">{t('save')}</button>
          <button className="button light" type="button" onClick={closeModal}>{t('cancel')}</button>
        </div>
      </form>
    </>
  )
}
