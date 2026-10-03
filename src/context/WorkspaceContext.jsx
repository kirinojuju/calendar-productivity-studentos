import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { loadWorkspace, WORKSPACE_KEY } from '../data/workspace.js'
import AuthPage from '../pages/AuthPage.jsx'

const WorkspaceContext = createContext(null)
const makeId = () => globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(36).slice(2)}`

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-StudentOS-Request': '1', ...options.headers },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'Could not reach the server.')
    error.status = response.status
    throw error
  }
  return data
}

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null)
  const [user, setUser] = useState(null)
  const [phase, setPhase] = useState('loading')
  const [authError, setAuthError] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved')
  const [hasLocalData, setHasLocalData] = useState(() => !!localStorage.getItem(WORKSPACE_KEY))
  const versionRef = useRef(0)
  const pendingRef = useRef(null)
  const savePromiseRef = useRef(null)
  const timerRef = useRef(null)
  const skipNextSaveRef = useRef(false)
  const bootstrappedRef = useRef(false)

  async function loadAccount() {
    setPhase('loading')
    setAuthError('')
    try {
      const session = await api('/api/session')
      const data = await api('/api/workspace')
      versionRef.current = data.version
      pendingRef.current = null
      skipNextSaveRef.current = true
      setWorkspace(data.workspace)
      setUser(session.user)
      setSaveStatus('saved')
      setPhase('ready')
    } catch (error) {
      setPhase(error.status === 401 ? 'guest' : 'error')
      if (error.status !== 401) setAuthError(error.message)
    }
  }

  useEffect(() => {
    if (bootstrappedRef.current) return
    bootstrappedRef.current = true
    loadAccount()
  }, [])

  function flush() {
    if (savePromiseRef.current) return savePromiseRef.current
    savePromiseRef.current = (async () => {
      while (pendingRef.current) {
        const draft = pendingRef.current
        pendingRef.current = null
        setSaveStatus('saving')
        try {
          const result = await api('/api/workspace', { method: 'PUT', body: JSON.stringify({ version: versionRef.current, workspace: draft }) })
          versionRef.current = result.version
          setSaveStatus(pendingRef.current ? 'saving' : 'saved')
        } catch (error) {
          if (!pendingRef.current) pendingRef.current = draft
          setSaveStatus(error.status === 409 ? 'conflict' : 'error')
          throw error
        }
      }
    })().finally(() => { savePromiseRef.current = null })
    return savePromiseRef.current
  }

  useEffect(() => {
    if (!workspace) return
    if (phase === 'demo') {
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace))
      setSaveStatus('local')
      return
    }
    if (phase !== 'ready') return
    if (skipNextSaveRef.current) { skipNextSaveRef.current = false; return }
    pendingRef.current = workspace
    setSaveStatus('saving')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { flush().catch(() => {}) }, 300)
    return () => clearTimeout(timerRef.current)
  }, [workspace, phase])

  useEffect(() => {
    if (saveStatus === 'saved' || saveStatus === 'local') return
    const warn = event => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [saveStatus])

  async function authenticate(mode, email, password) {
    const data = await api(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify({ email, password }) })
    const saved = await api('/api/workspace')
    versionRef.current = saved.version
    pendingRef.current = null
    skipNextSaveRef.current = true
    setWorkspace(saved.workspace)
    setUser(data.user)
    setSaveStatus('saved')
    setPhase('ready')
  }

  async function logout() {
    if (phase === 'demo') {
      setPhase('guest')
      setWorkspace(null)
      setUser(null)
      return
    }
    clearTimeout(timerRef.current)
    if (pendingRef.current || savePromiseRef.current) await flush()
    await api('/api/auth/logout', { method: 'POST', body: '{}' })
    setWorkspace(null)
    setUser(null)
    setPhase('guest')
  }

  function importLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY))
      if (!saved || !Array.isArray(saved.tasks) || !Array.isArray(saved.events) || !saved.finance) throw new Error('No valid local workspace found.')
      setWorkspace(saved)
      setHasLocalData(false)
    } catch (error) { setAuthError(error.message) }
  }

  async function reloadWorkspace() {
    const data = await api('/api/workspace')
    versionRef.current = data.version
    pendingRef.current = null
    skipNextSaveRef.current = true
    setWorkspace(data.workspace)
    setSaveStatus('saved')
  }

  function previewLocally() {
    setWorkspace(loadWorkspace())
    setUser({ email: 'Local preview' })
    setSaveStatus('local')
    setPhase('demo')
  }

  const actions = useMemo(() => ({
    toggleRoutine(id, day) { setWorkspace(current => ({ ...current, routine: current.routine.map(item => item.id === id ? { ...item, completedOn: item.completedOn === day ? '' : day, done: false } : item) })) },
    addRoutine(item) { setWorkspace(current => ({ ...current, routine: [...current.routine, { id: makeId(), title: item.title, time: item.time, completedOn: '', done: false }] })) },
    deleteRoutine(id) { setWorkspace(current => ({ ...current, routine: current.routine.filter(item => item.id !== id) })) },
    addTask(task) { setWorkspace(current => ({ ...current, tasks: [...current.tasks, { id: makeId(), status: 'todo', priority: 'medium', important: false, importantPoint: '', dueDate: '', courseId: '', project: '', ...task }] })) },
    updateTask(id, patch) { setWorkspace(current => ({ ...current, tasks: current.tasks.map(task => task.id === id ? { ...task, ...patch } : task) })) },
    deleteTask(id) { setWorkspace(current => ({ ...current, tasks: current.tasks.filter(task => task.id !== id) })) },
    addCourse(course) { setWorkspace(current => ({ ...current, courses: [...current.courses, { id: makeId(), ...course }] })) },
    updateCourse(id, patch) { setWorkspace(current => ({ ...current, courses: current.courses.map(course => course.id === id ? { ...course, ...patch } : course) })) },
    deleteCourse(id) { setWorkspace(current => ({ ...current, courses: current.courses.filter(course => course.id !== id), tasks: current.tasks.map(task => task.courseId === id ? { ...task, courseId: '' } : task) })) },
    addEvent(event) { setWorkspace(current => ({ ...current, events: [...current.events, { id: makeId(), reminderMinutes: 0, location: '', notes: '', ...event }] })) },
    updateEvent(id, patch) { setWorkspace(current => ({ ...current, events: current.events.map(event => event.id === id ? { ...event, ...patch } : event) })) },
    deleteEvent(id) { setWorkspace(current => ({ ...current, events: current.events.filter(event => event.id !== id) })) },
    updateFinance(patch) { setWorkspace(current => ({ ...current, finance: { ...current.finance, ...patch } })) },
    addTransaction(transaction) { setWorkspace(current => ({ ...current, finance: { ...current.finance, transactions: [{ id: makeId(), ...transaction }, ...current.finance.transactions] } })) },
    deleteTransaction(id) { setWorkspace(current => ({ ...current, finance: { ...current.finance, transactions: current.finance.transactions.filter(transaction => transaction.id !== id) } })) },
    addNote() { const id = makeId(); setWorkspace(current => ({ ...current, notes: [{ id, title: 'Untitled', updatedAt: new Date().toISOString().slice(0, 10), blocks: [] }, ...current.notes] })); return id },
    updateNote(id, patch) { setWorkspace(current => ({ ...current, notes: current.notes.map(note => note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : note) })) },
    deleteNote(id) { setWorkspace(current => ({ ...current, notes: current.notes.filter(note => note.id !== id) })) },
  }), [])

  if (phase === 'loading') return <div className="auth-screen"><div className="auth-card">Loading your workspace…</div></div>
  if (phase === 'error') return <div className="auth-screen"><div className="auth-card"><h1>StudentOS</h1><p>Could not connect to PostgreSQL. {authError}</p><div className="auth-actions"><button className="auth-submit" onClick={loadAccount}>Retry connection</button><button className="auth-switch" onClick={previewLocally}>Preview on this device</button></div><p className="auth-hint">Preview data stays in this browser until you import it into an account.</p></div></div>
  if (phase === 'guest') return <AuthPage onSubmit={authenticate} />

  return <WorkspaceContext.Provider value={{ workspace, actions, user, saveStatus, isDemo: phase === 'demo', hasLocalData, importLocal, logout, retrySave: () => flush().catch(() => {}), reloadWorkspace }}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return value
}
