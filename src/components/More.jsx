import { useStore } from '../store.jsx'
import { useStats } from '../useStats.js'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import {
  IconReports, IconDebts, IconExpenses,
  IconSettings, IconHelp, IconPlay, IconLogout, IconChevron,
} from './icons.jsx'

function Row({ Icon, label, sub, onClick, accent, tour }) {
  return (
    <button className="more-row" onClick={onClick} data-tour={tour}>
      <span className={`more-row-icon${accent ? ` more-row-icon--${accent}` : ''}`}><Icon /></span>
      <span className="more-row-text">
        <span className="more-row-label">{label}</span>
        {sub && <span className={`more-row-sub${accent === 'debt' ? ' more-row-sub--bad' : ''}`}>{sub}</span>}
      </span>
      <span className="more-row-chevron"><IconChevron size={18} /></span>
    </button>
  )
}

export default function More() {
  const { state, dispatch, activeProfile, enterDemoTour } = useStore()
  const { totalDebt } = useStats()
  const t = useLang()

  const go = view => dispatch({ type: 'SET_VIEW', payload: view })

  return (
    <div className="more-screen">
      <div className="more-profile">
        <span className="more-avatar">{(state.shop.owner || state.shop.name || '?').slice(0, 1).toUpperCase()}</span>
        <span className="more-profile-text">
          <strong>{state.shop.owner || state.shop.name}</strong>
          <span>{state.shop.name}</span>
        </span>
      </div>

      <div className="more-group">
        <Row Icon={IconReports} label={t('navReports')} sub={t('reportsSub')} onClick={() => go('reports')} tour="more-reports" />
        <Row
          Icon={IconDebts}
          label={t('navDebts')}
          sub={totalDebt > 0 ? `${money(totalDebt)} ${t('owedSuffix')}` : t('debtsSub')}
          accent={totalDebt > 0 ? 'debt' : undefined}
          onClick={() => go('debts')}
        />
        <Row Icon={IconExpenses} label={t('navExpenses')} sub={t('expensesSub')} onClick={() => go('expenses')} />
      </div>

      <div className="more-group">
        <Row Icon={IconSettings} label={t('navSettings')} onClick={() => go('settings')} tour="more-settings" />
        <Row Icon={IconHelp} label={t('navHelp')} onClick={() => go('help')} />
        {activeProfile === 'main' && (
          <>
            <Row Icon={IconLogout} label={t('navLogout')} sub={t('logoutSub')} onClick={() => go('logout')} accent="danger" />
            <Row Icon={IconPlay} label={t('tryDemoMode')} sub={t('demoModeHint')} onClick={enterDemoTour} />
          </>
        )}
      </div>
    </div>
  )
}
