import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import Logo from './Logo.jsx'

export default function Setup() {
  const { state, dispatch } = useStore()
  const t = useLang()

  function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    dispatch({
      type: 'COMPLETE_SETUP',
      payload: {
        name: data.get('shop').trim(),
        owner: data.get('owner').trim(),
        phone: data.get('phone').trim(),
      },
    })
  }

  return (
    <div className="setup-page">
      <div className="setup-lang">
        <select
          className="select"
          aria-label="Language"
          value={state.language}
          style={{ minHeight: 40, fontSize: '0.9rem' }}
          onChange={e => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
        >
          <option value="pidgin">Pidgin</option>
          <option value="en">English</option>
          <option value="yo">Yoruba</option>
          <option value="ig">Igbo</option>
          <option value="ha">Hausa</option>
        </select>
      </div>

      <div className="setup-card">
        <div className="setup-logo">
          <Logo size={52} />
          <div>
            <strong>Ulahia</strong>
            <span>{t('tagline')}</span>
          </div>
        </div>

        <h1 className="setup-title">Set up your shop</h1>
        <p className="setup-sub">Enter your details to get started. You can change them anytime.</p>

        <form onSubmit={handleSubmit} className="setup-form">
          <label className="label">
            Shop name
            <input
              className="field"
              name="shop"
              placeholder="e.g. Mama Grace Store"
              autoFocus
              required
            />
          </label>
          <label className="label">
            Your name
            <input
              className="field"
              name="owner"
              placeholder="e.g. Grace"
              required
            />
          </label>
          <label className="label">
            Phone <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
            <input
              className="field"
              name="phone"
              placeholder="0803 xxx xxxx"
            />
          </label>
          <button className="button setup-submit" type="submit">
            Start selling →
          </button>
        </form>
      </div>
    </div>
  )
}
