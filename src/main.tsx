import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

let updateSWHandler: ((reloadPage?: boolean) => Promise<void>) | null = null

export const updateAppServiceWorker = async (reloadPage: boolean = true) => {
  if (updateSWHandler) {
    await updateSWHandler(reloadPage)
  } else {
    window.location.reload()
  }
}

// Register PWA Service Worker for offline support with active update detection
updateSWHandler = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version detected by Service Worker.')
    window.dispatchEvent(new CustomEvent('midterm-ace:update-available'))
  },
  onOfflineReady() {
    console.log('[PWA] MidtermAce is ready to work offline.')
  },
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      ;(window as any).__SW_REGISTRATION__ = registration
      console.log('[PWA] Service Worker registered:', swUrl)
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
