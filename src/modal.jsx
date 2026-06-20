import { createContext, useContext, useState, useCallback } from 'react'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [content, setContent] = useState(null)
  const openModal = useCallback((node) => setContent(node), [])
  const closeModal = useCallback(() => setContent(null), [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <div
        className={`modal-backdrop${content ? ' is-open' : ''}`}
        onClick={e => e.target === e.currentTarget && closeModal()}
      >
        {content && <div className="modal">{content}</div>}
      </div>
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
