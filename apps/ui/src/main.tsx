import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BlockchainProvider } from './providers/BlockchainProvider'

createRoot(document.getElementById('root')!).render(
  // <StrictMode> // <-- Temporarily commented out
    <BlockchainProvider>
      <App />
    </BlockchainProvider>
  // </StrictMode> // <-- Temporarily commented out
)