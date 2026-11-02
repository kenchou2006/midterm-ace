import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register PWA Service Worker for offline support
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New content available, reload to update.')
  },
  onOfflineReady() {
    console.log('App ready to work offline.')
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
