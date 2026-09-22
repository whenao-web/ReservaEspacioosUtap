import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { SesionProvider } from './context/SesionContext'
import App from './App'
import './index.css'

// basename = BASE_PATH de vite.config.js. En GitHub Pages es /REPOSITORIO/
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SesionProvider>
        <App />
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>
)
