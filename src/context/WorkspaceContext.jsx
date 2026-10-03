import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { loadWorkspace, validateWorkspace, WORKSPACE_KEY } from '../data/workspace.js'
import AuthPage from '../pages/AuthPage.jsx'
import { auth } from '../services/firebase.js'
import { readWorkspace, saveWorkspace, WorkspaceConflictError } from '../services/workspace.js'

const WorkspaceContext = createContext(null)
const makeId = () => globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(36).slice(2)}`

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null)
  const [user, setUser] = useState(null)
  const [phase, setPhase] = useState('loading')
  const [authError, setAuthError] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved')
  const [hasLocalData, setHasLocalData] = useState(() => !!localStorage.getItem(WORKSPACE_KEY))
  const versionRef = useRef(0)
  const userRef = useRef(null)
  const pendingRef = useRef(null)
  const savePromiseRef = useRef(null)
  const timerRef = useRef(null)
  const skipNextSaveRef = useRef(false)
  const previewRef = useRef(false)
  const loadTokenRef = useRef(0)

  async function loadAccount(firebaseUser = auth.currentUser) {
    const token = ++loadTokenRef.current
    if (!firebaseUser) {
      userRef.current = null
      setWorkspace(null)
      setUser(null)
      setPhase('guest')
      return
    }
    setPhase('loading')
    setAuthError('')
    try {
      const data = await readWorkspace(firebaseUser.uid)
      if (token !== loadTokenRef.current || previewRef.current) return
      versionRef.current = data.version
      userRef.current = firebaseUser.uid
      pendingRef.current = null
      skipNextSaveRef.current = true
      setWorkspace(data.workspace)
      setUser({ id: firebaseUser.uid, email: firebaseUser.email || 'Your account' })
      setSaveStatus('saved')
      setPhase('ready')
    } catch (error) {
      if (token !== loadTokenRef.current || previewRef.current) return
      setAuthError(error.message)
      setPhase('error')
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, current => {
      if (!previewRef.current) loadAccount(current)
    }, error => {
      setAuthError(error.message)
      setPhase('error')
    })
    return () => { loadTokenRef.current++; unsubscribe() }
  }, [])

  function flush() {
    if (savePromiseRef.current) return savePromiseRef.current
    savePromiseRef.current = (async () => {
      while (pendingRef.current) {
        const draft = pendingRef.current
        pendingRef.current = null
        setSaveStatus('saving')
        try {
          versionRef.current = await saveWorkspace(userRef.current, versionRef.current, draft)
          setSaveStatus(pendingRef.current ? 'saving' : 'saved')
        } catch (error) {
          if (!pendingRef.current) pendingRef.current = draft
          setSaveStatus(error instanceof WorkspaceConflictError ? 'conflict' : 'error')
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
    try {
      if (mode === 'register') await createUserWithEmailAndPassword(auth, email, password)
      else await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') throw new Error('This email is already registered.')
      if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(error.code)) throw new Error('Incorrect email or password.')
      if (error.code === 'auth/weak-password') throw new Error('Choose a stronger password.')
      throw error
    }
  }

  async function logout() {
    if (phase === 'demo') {
      previewRef.current = false
      await loadAccount()
      return
    }
    clearTimeout(timerRef.current)
    if (pendingRef.current || savePromiseRef.current) await flush()
    await signOut(auth)
    userRef.current = null
    setWorkspace(null)
    setUser(null)
    setPhase('guest')
  }

  function importLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY))
      if (!validateWorkspace(saved)) throw new Error('No valid local workspace found.')
      setWorkspace(saved)
      setHasLocalData(false)
    } catch (error) { window.alert(error.message) }
  }

  async function reloadWorkspace() {
    const data = await readWorkspace(userRef.current)
    versionRef.current = data.version
    pendingRef.current = null
    skipNextSaveRef.current = true
    setWorkspace(data.workspace)
    setSaveStatus('saved')
  }

  function previewLocally() {
    previewRef.current = true
    loadTokenRef.current++
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
    addCourse(course) { const id = makeId(); setWorkspace(current => ({ ...current, courses: [...current.courses, { id, ...course }] })); return id },
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
    updateNoteBlocks(id, updateBlocks) { setWorkspace(current => ({ ...current, notes: current.notes.map(note => note.id === id ? { ...note, blocks: updateBlocks(note.blocks), updatedAt: new Date().toISOString().slice(0, 10) } : note) })) },
    deleteNote(id) { setWorkspace(current => ({ ...current, notes: current.notes.filter(note => note.id !== id) })) },
  }), [])

  if (phase === 'loading') return <div className="auth-screen"><div className="auth-card">Loading your workspace…</div></div>
  if (phase === 'error') return <div className="auth-screen"><div className="auth-card"><h1>StudentOS</h1><p>Could not connect to Firebase. {authError}</p><div className="auth-actions"><button className="auth-submit" onClick={() => loadAccount()}>Retry connection</button><button className="auth-switch" onClick={previewLocally}>Preview on this device</button></div><p className="auth-hint">Preview data stays in this browser until you import it into an account.</p></div></div>
  if (phase === 'guest') return <AuthPage onSubmit={authenticate} onPreview={previewLocally} />

  return <WorkspaceContext.Provider value={{ workspace, actions, user, saveStatus, isDemo: phase === 'demo', hasLocalData, importLocal, logout, retrySave: () => flush().catch(() => {}), reloadWorkspace }}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return value
}
