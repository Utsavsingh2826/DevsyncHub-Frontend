import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'remixicon/fonts/remixicon.css'
import 'highlight.js/styles/nord.css'
import './utils/webcontainerDiagnostics.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(

  <App />

)
