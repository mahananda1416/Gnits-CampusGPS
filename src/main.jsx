// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'   // <-- make sure this line exists

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => console.log('Service worker registered:', reg))
      .catch(err => console.error('Service worker error:', err));
  });
}
// import { registerSW } from 'virtual:pwa-register'

// registerSW({
//   onNeedRefresh() {},
//   onOfflineReady() {
//     console.log('App is ready to work offline!')
//   },
// })
