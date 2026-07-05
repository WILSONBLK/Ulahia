import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [content, setContent] = useState(null)
  const modalRef = useRef(null)
  const openerRef = useRef(null)
  const openModal = useCallback((node) => {
    openerRef.current = document.activeElement
    setContent(node)
  }, [])
  const closeModal = useCallback(() => {
    setContent(null)
    // Return focus to whatever opened the dialog
    if (openerRef.current?.focus) openerRef.current.focus()
  }, [])

  // Escape closes; the dialog takes focus on open so keyboard/screen-reader
  // users land inside it
  useEffect(() => {
    if (!content) return
    const onKey = e => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => {
      if (!modalRef.current) return
      const auto = modalRef.current.querySelector('[autofocus], input, select, textarea')
      ;(auto || modalRef.current).focus()
    }, 40)
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(t) }
  }, [content, closeModal])

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <div
        className={`modal-backdrop${content ? ' is-open' : ''}`}
        onClick={e => e.target === e.currentTarget && closeModal()}
      >
        {content && (
          <div className="modal" role="dialog" aria-modal="true" tabIndex={-1} ref={modalRef}>
            {content}
          </div>
        )}
      </div>
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
