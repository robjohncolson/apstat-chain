import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BlockchainProvider } from './providers/BlockchainProvider'
import { CurriculumProvider } from './providers/CurriculumProvider'

createRoot(document.getElementById('root')!).render(
  // <StrictMode> // <-- Temporarily commented out
    <BlockchainProvider>
      <CurriculumProvider>
        <App />
      </CurriculumProvider>
    </BlockchainProvider>
  // </StrictMode> // <-- Temporarily commented out
)