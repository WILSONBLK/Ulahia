import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'
import { ToastProvider } from './toast.jsx'
import { ModalProvider } from './modal.jsx'
import { PinGateProvider } from './components/PinGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <ModalProvider>
          <PinGateProvider>
            <App />
          </PinGateProvider>
        </ModalProvider>
      </ToastProvider>
    </StoreProvider>
  </StrictMode>
)
