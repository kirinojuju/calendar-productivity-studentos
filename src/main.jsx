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
import './styles/dark.css'

const savedTheme = localStorage.getItem('studentos-theme')
document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light'
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', savedTheme === 'dark' ? '#191919' : '#f7f7f5')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
