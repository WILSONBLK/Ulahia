import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'

const TITLE_KEYS = {
  customers: 'navCustomers',
  debts: 'navDebts',
  products: 'navProducts',
  reports: 'navReports',
  expenses: 'navExpenses',
  settings: 'navSettings',
  help: 'navHelp',
  more: 'navMore',
}

export default function TopBar() {
  const { state, dispatch } = useStore()
  const t = useLang()

  return (
    <header className="topbar">
      <button
        className="topbar-back"
        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
      >
        ←
      </button>
      <strong className="topbar-title">{TITLE_KEYS[state.view] ? t(TITLE_KEYS[state.view]) : ''}</strong>
      <select
        className="select"
        aria-label="Language"
        value={state.language}
        onChange={e => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
      >
        <option value="pidgin">Pidgin</option>
        <option value="en">English</option>
        <option value="yo">Yoruba</option>
        <option value="ig">Igbo</option>
        <option value="ha">Hausa</option>
      </select>
    </header>
  )
}
