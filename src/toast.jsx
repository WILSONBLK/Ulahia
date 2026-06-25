import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const [undoFn, setUndoFn] = useState(null)
  const timer = useRef(null)

  const showToast = useCallback((message, options = {}) => {
    setMsg(message)
    setUndoFn(options.undo ? () => options.undo : null)
    setVisible(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), options.undo ? 3500 : 2400)
  }, [])

  function handleUndo() {
    if (undoFn) undoFn()
    setVisible(false)
    clearTimeout(timer.current)
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast${visible ? ' is-visible' : ''}`}>
        <span>{msg}</span>
        {undoFn && (
          <button className="toast-undo-btn" onClick={handleUndo}>Undo</button>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
