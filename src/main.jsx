import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'
import { ToastProvider } from './toast.jsx'
import { ModalProvider } from './modal.jsx'
import { PinGateProvider } from './components/PinGate.jsx'
import { TopBarActionsProvider } from './topbarActions.jsx'
import { setupIOSZoomReset } from './iosZoom.js'

setupIOSZoomReset()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <ModalProvider>
          <PinGateProvider>
            <TopBarActionsProvider>
              <App />
            </TopBarActionsProvider>
          </PinGateProvider>
        </ModalProvider>
      </ToastProvider>
    </StoreProvider>
  </StrictMode>
)
