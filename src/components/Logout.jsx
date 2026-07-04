import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { useToast } from '../toast.jsx'
import { useModal } from '../modal.jsx'

function ConfirmLogoutModal({ onConfirm, onCancel }) {
  const t = useLang()
  return (
    <div className="panel" style={{ maxWidth: 420, width: '100%' }}>
      <h3 style={{ margin: '0 0 14px' }}>{t('logoutConfirmTitle')}</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 20px' }}>
        {t('logoutConfirmDesc')}
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="button" style={{ background: 'var(--red)', borderColor: 'transparent', flex: 1 }} onClick={() => { onConfirm(); onCancel() }}>
          {t('logoutConfirmBtn')}
        </button>
        <button className="button light" style={{ flex: 1 }} onClick={onCancel}>
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}

export default function Logout() {
  const { dispatch } = useStore()
  const t = useLang()
  const showToast = useToast()
  const { openModal, closeModal } = useModal()

  function handleLogout() {
    sessionStorage.removeItem('ulahia-unlocked')
    dispatch({ type: 'LOGOUT' })
    showToast(t('loggedOutToast'))
  }

  function confirmLogout() {
    openModal(<ConfirmLogoutModal onConfirm={handleLogout} onCancel={closeModal} />)
  }

  return (
    <div className="screen-content">
      <section className="panel">
        <h3 style={{ margin: '0 0 14px' }}>{t('logoutTitle')}</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 18px' }}>
          {t('logoutDesc')}
        </p>
        <button className="button" style={{ background: 'var(--red)', borderColor: 'transparent' }} onClick={confirmLogout}>
          {t('logoutBtn')}
        </button>
      </section>
    </div>
  )
}
