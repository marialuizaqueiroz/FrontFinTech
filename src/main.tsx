import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { USE_MOCK } from './config/api'

async function prepare() {
  if (USE_MOCK) {
    const { worker } = await import('./mocks/browser')
    console.log('🎭 MSW ativado - usando dados mockados')
    return worker.start({
      onUnhandledRequest: 'bypass'
    })
  }
  console.log('🌐 Usando backend real')
  return Promise.resolve()
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
