import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useToast } from '../toast.jsx'
import { useLang } from '../useLang.js'

export default function Settings() {
  const { state, dispatch, activeProfile, switchProfile } = useStore()
  const showToast = useToast()
  const t = useLang()
  const [form, setForm] = useState({
    name: state.shop.name,
    owner: state.shop.owner,
    phone: state.shop.phone,
  })

  function field(key) {
    return {
      className: 'field',
      value: form[key],
      onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    }
  }

  function save() {
    if (!form.name.trim()) { showToast('Shop name is required.'); return }
    dispatch({ type: 'UPDATE_SHOP', payload: form })
    showToast('Settings saved.')
  }

  function importData(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data.products)) { showToast('Invalid backup file.'); return }
        dispatch({ type: 'IMPORT_STATE', payload: data })
        showToast('Data restored!')
      } catch { showToast('Could not read file.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function exportData() {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.shop.name || 'ulahia'}-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported.')
  }

  const isDemo = activeProfile === 'demo'

  function handleSwitch() {
    switchProfile(isDemo ? 'main' : 'demo')
    showToast(isDemo ? 'Switched to your shop.' : 'Switched to Demo.')
  }

  return (
    <div className="screen-content">
      <section className="panel">
        <h3 style={{ margin: '0 0 18px' }}>{t('shopDetails')}</h3>
        <div style={{ display: 'grid', gap: 14 }}>
          <label className="label">
            {t('shopName')}
            <input {...field('name')} placeholder="e.g. Mama Ngozi Store" />
          </label>
          <label className="label">
            {t('yourName')}
            <input {...field('owner')} placeholder="e.g. Ngozi" />
          </label>
          <label className="label">
            {t('phoneNumber')}
            <input {...field('phone')} type="tel" placeholder="0803 000 0000" />
          </label>
          <button className="button" onClick={save}>{t('saveChanges')}</button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>Backup &amp; Export</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 14px' }}>
          Download all your shop data as a JSON file you can keep as a backup.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="button secondary" onClick={exportData}>⬇ Export Data</button>
          <label className="button light" style={{ cursor: 'pointer', minHeight: 42, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
            ⬆ Restore Backup
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
          </label>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 10px' }}>Accounts</h3>
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            background: isDemo ? '#fff3bf' : '#e6f7f1',
            color: isDemo ? '#4d3200' : '#087f5b',
            fontSize: '0.83rem', fontWeight: 700, letterSpacing: '0.02em',
          }}>
            {isDemo ? 'Demo Account' : 'My Shop'}
          </span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 14px' }}>
          {isDemo
            ? 'You are on the Demo account. Your real shop data is saved and untouched.'
            : 'Switch to Demo to explore sample data. Your shop data stays safe.'}
        </p>
        <button className="button light" onClick={handleSwitch}>
          {isDemo ? '→ Switch to My Shop' : '→ Switch to Demo'}
        </button>
      </section>
    </div>
  )
}
