import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import Icon from './Icon.jsx'
import CalendarMonth from './CalendarMonth.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { courseSessions } from '../utils/dates.js'
import { dateKey, fromDateKey, monthCells, shiftDate, shortDate } from '../utils/dates.js'

const links = [
  ['Today', '/', 'home'], ['Calendar', '/calendar', 'calendar'], ['Tasks', '/tasks', 'check'],
  ['Academic', '/academic', 'cap'], ['Finance', '/finance', 'wallet'], ['Notes', '/notes', 'note'],
]

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { workspace, user, saveStatus, isDemo, hasLocalData, importLocal, logout, retrySave, reloadWorkspace } = useWorkspace()
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()))
  const [month, setMonth] = useState(dateKey(new Date()))
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const isToday = location.pathname === '/'
  const dayEvents = [...courseSessions(workspace.courses, selectedDate), ...workspace.events.filter(event => event.date === selectedDate)].sort((a, b) => a.start.localeCompare(b.start))
  const monthItems = [...workspace.events, ...monthCells(month).flatMap(day => courseSessions(workspace.courses, day))]
  const results = search.trim() ? [
    ...workspace.tasks.filter(item => item.title.toLowerCase().includes(search.toLowerCase())).map(item => ({ ...item, to: '/tasks', group: 'Task' })),
    ...workspace.notes.filter(item => item.title.toLowerCase().includes(search.toLowerCase())).map(item => ({ ...item, to: '/notes', group: 'Note' })),
    ...workspace.events.filter(item => item.title.toLowerCase().includes(search.toLowerCase())).map(item => ({ ...item, to: '/calendar', group: 'Event' })),
  ] : []
  const upcomingReminders = workspace.events.filter(event => event.kind === 'reminder' && event.date >= dateKey(new Date())).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).slice(0, 3)

  function selectDate(day) {
    setSelectedDate(day)
    setMonth(day)
  }

  return <div className={`app-shell ${isToday ? '' : 'full-workspace'}`}>
    <aside className="sidebar" aria-label="Main navigation">
      <div className="brand-row"><span className="brand">StudentOS</span><button className="icon-button sidebar-search" aria-label="Search" onClick={() => setSearchOpen(value => !value)}><Icon name="search" size={16} /></button></div>
      <nav className="primary-nav">{links.map(([label, to, icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => { if (to === '/') selectDate(dateKey(new Date())) }} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon"><Icon name={icon} size={15} /></span>{label}</NavLink>)}</nav>
      <div className="term-block"><div className="term-heading">Fall {new Date().getFullYear()}</div><NavLink className="nav-item term-item" to="/academic">Courses</NavLink><NavLink className="nav-item term-item" to="/tasks">Assignments</NavLink><NavLink className="nav-item term-item" to="/academic">Exams</NavLink></div>
      <div className="account"><strong>{user.email}</strong><span>{isDemo ? 'Browser preview only' : saveStatus === 'saved' ? 'Saved to your account' : saveStatus === 'saving' ? 'Saving…' : 'Changes need attention'}</span></div>
    </aside>
    <main className="main-panel">
      <div className="topbar"><div className="date-controls"><button className="plain-icon" aria-label="Previous day" onClick={() => selectDate(shiftDate(selectedDate, -1))}><Icon name="left" size={13} /></button><button className="plain-icon" aria-label="Next day" onClick={() => selectDate(shiftDate(selectedDate, 1))}><Icon name="right" size={13} /></button><strong>{isToday ? `${selectedDate === dateKey(new Date()) ? 'Today' : 'Plan'}, ${shortDate(selectedDate)}` : links.find(([, to]) => to === location.pathname)?.[0]}</strong></div><div className="topbar-actions"><span className="weather"><Icon name="sun" size={13} /> Stay on track</span><button className="plain-icon" aria-label="Notifications" onClick={() => { setNoticeOpen(value => !value); setAccountOpen(false) }}><Icon name="bell" size={15} /></button><button className="plain-icon" aria-label="Account" onClick={() => { setAccountOpen(value => !value); setNoticeOpen(false) }}><Icon name="user" size={16} /></button></div></div>
      {noticeOpen && <div className="app-notice"><strong>Upcoming reminders</strong>{upcomingReminders.length ? upcomingReminders.map(event => <span key={event.id}>{event.date} · {event.start} — {event.title}</span>) : <span>No upcoming reminders.</span>}</div>}
      {accountOpen && <div className="app-notice account-menu"><strong>{user.email}</strong><span>{isDemo ? 'Preview data is saved only in this browser.' : saveStatus === 'saved' ? 'All changes saved to PostgreSQL.' : saveStatus === 'saving' ? 'Saving your changes…' : saveStatus === 'conflict' ? 'This account changed in another tab or device.' : 'Could not save. Check the connection.'}</span>{saveStatus === 'error' && <button onClick={retrySave}>Retry save</button>}{saveStatus === 'conflict' && <button onClick={() => { if (window.confirm('Reload saved data? Unsaved changes in this tab will be lost.')) reloadWorkspace().catch(() => {}) }}>Reload saved data</button>}{!isDemo && hasLocalData && !workspace.tasks.length && !workspace.courses.length && !workspace.events.length && !workspace.notes.length && !workspace.finance.transactions.length && <button onClick={importLocal}>Import data from this browser</button>}<button onClick={() => logout().catch(error => window.alert(error.message))}>{isDemo ? 'Exit preview' : 'Sign out'}</button></div>}
      {searchOpen && <div className="search-panel"><Icon name="search" size={16} /><input autoFocus aria-label="Search workspace" placeholder="Search tasks, events, notes..." value={search} onChange={event => setSearch(event.target.value)} /><button className="plain-icon" aria-label="Close search" onClick={() => { setSearchOpen(false); setSearch('') }}><Icon name="close" size={15} /></button>{search && <div className="search-results">{results.length ? results.map(item => <button key={`${item.group}-${item.id}`} onClick={() => { navigate(item.to); setSearchOpen(false); setSearch('') }}><strong>{item.title}</strong><span>{item.group}</span></button>) : <p>No matching items</p>}</div>}</div>}
      <Outlet context={{ selectedDate, setSelectedDate: selectDate }} />
    </main>
    {isToday && <aside className="right-panel" aria-label="Calendar and agenda"><div className="calendar-header"><h2>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(fromDateKey(month))}</h2><div><button className="plain-icon" aria-label="Previous month" onClick={() => setMonth(dateKey(new Date(fromDateKey(month).getFullYear(), fromDateKey(month).getMonth() - 1, 1)))}><Icon name="left" size={13} /></button><button className="plain-icon" aria-label="Next month" onClick={() => setMonth(dateKey(new Date(fromDateKey(month).getFullYear(), fromDateKey(month).getMonth() + 1, 1)))}><Icon name="right" size={13} /></button></div></div><CalendarMonth month={month} selectedDate={selectedDate} onSelectDate={selectDate} events={monthItems} compact /><div className="agenda"><h2>{shortDate(selectedDate)}</h2><p className="agenda-note"><span />{dayEvents.length ? 'Your schedule for the day' : 'A fresh day to plan'}</p><div className="agenda-events">{dayEvents.length ? dayEvents.map(event => <div className="agenda-row" key={event.id}><span className="event-time">{event.start}</span><div className={`event-card ${event.kind === 'class' ? 'orange' : event.kind === 'reminder' ? 'purple' : 'green'}`}><strong>{event.title}</strong>{event.location && <span>{event.location}</span>}</div></div>) : <p className="empty-agenda">No events planned</p>}</div></div></aside>}
  </div>
}
