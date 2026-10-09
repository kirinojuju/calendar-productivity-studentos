import { useState } from 'react'
import Icon from './Icon.jsx'

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#191919' : '#f7f7f5')
    localStorage.setItem('studentos-theme', nextTheme)
    setTheme(nextTheme)
  }

  const isDark = theme === 'dark'
  return (
    <button type="button" className={`plain-icon theme-toggle ${className}`.trim()}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'} aria-pressed={isDark}
      onClick={toggleTheme}>
      <Icon name={isDark ? 'sun' : 'moon'} size={16} />
    </button>
  )
}
