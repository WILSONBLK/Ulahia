import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { useNotifications } from '../useNotifications.js'
import { IconBox, IconDebts, IconCloud, IconBell, IconChevron, IconCheck } from './icons.jsx'

const ICONS = { box: IconBox, debt: IconDebts, cloud: IconCloud }

export default function Notifications() {
  const { dispatch } = useStore()
  const t = useLang()
  const { items } = useNotifications()

  if (!items.length) {
    return (
      <div className="screen-content">
        <div className="notif-empty">
          <span className="notif-empty-icon"><IconCheck size={30} /></span>
          <strong>{t('notifEmptyTitle')}</strong>
          <span>{t('notifEmptyBody')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-content">
      <div className="notif-list">
        {items.map(n => {
          const Icon = ICONS[n.icon] || IconBell
          const clickable = !!n.view
          return (
            <button
              key={n.id}
              className={`notif-card notif-card--${n.tone}${clickable ? '' : ' notif-card--static'}`}
              onClick={() => clickable && dispatch({ type: 'SET_VIEW', payload: n.view })}
              disabled={!clickable}
            >
              <span className="notif-card-icon"><Icon size={22} /></span>
              <span className="notif-card-text">
                <strong>{n.title}</strong>
                {n.body && <span>{n.body}</span>}
              </span>
              {clickable && <span className="notif-card-chevron"><IconChevron size={18} /></span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
