import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  const showToast = useCallback((message) => {
    setMsg(message)
    setVisible(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), 2400)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast${visible ? ' is-visible' : ''}`}>{msg}</div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
