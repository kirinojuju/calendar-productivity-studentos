import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.jsx'
import './index.css'
import './styles/modules.css'
import './styles/typography.css'
import './styles/today-classes.css'
import './styles/course-schedule.css'
import './styles/note-blocks.css'
import './styles/assistant.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
