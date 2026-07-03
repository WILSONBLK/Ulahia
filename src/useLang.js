import { useStore } from './store.jsx'
import { lang } from './lang.js'

export function useLang() {
  const { state } = useStore()
  return (key, params) => {
    let str = lang[state.language]?.[key] ?? lang.en[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replaceAll(`{${k}}`, v)
      }
    }
    return str
  }
}
