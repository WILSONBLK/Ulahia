import { useStore } from './store.jsx'
import { lang } from './lang.js'

export function useLang() {
  const { state } = useStore()
  return (key) => lang[state.language]?.[key] ?? lang.en[key] ?? key
}
