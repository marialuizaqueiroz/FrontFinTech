import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

async function prepare() {
  if (import.meta.env.MODE === 'development') {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass'
    })
  }
  return Promise.resolve()
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
