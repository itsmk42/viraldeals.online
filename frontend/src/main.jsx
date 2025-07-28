import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service worker registration disabled - no sw.js file exists
// If you want to enable PWA features, add a proper service worker file
// and uncomment the registration code below:
//
// import { register as registerSW } from './utils/serviceWorker'
// registerSW({
//   onSuccess: (registration) => {
//     console.log('Service Worker registered successfully');
//   },
//   onUpdate: (registration) => {
//     console.log('New content available, please refresh');
//   },
// })
