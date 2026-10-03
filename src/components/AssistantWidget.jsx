import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { courseSessions, dateKey } from '../utils/dates.js'

// Local artwork is optional and intentionally excluded from Git.
const spriteFiles = import.meta.glob('../../assets_ai_assistance/sprites/_kaito*.png', { eager: true, query: '?url', import: 'default' })
const spriteUrl = name => spriteFiles[`../../assets_ai_assistance/sprites/${name}`]
const idleLeft = spriteUrl('_kaito_idle_l.png')
const idleRight = spriteUrl('_kaito_idle_r.png')
const walkingLeft = [0, 1, 2, 3].map(number => spriteUrl(`_kaito_walk_l0${number}.png`))
const walkingRight = [0, 1, 2, 3].map(number => spriteUrl(`_kaito_walk_r0${number}.png`))
const hasSprite = Boolean(idleLeft && idleRight && walkingLeft.every(Boolean) && walkingRight.every(Boolean))

export default function AssistantWidget() {
  const { workspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const [autoWalking, setAutoWalking] = useState(false)
  const [autoDirection, setAutoDirection] = useState('left')
  const [frame, setFrame] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [motionPreference, setMotionPreference] = useState(() => localStorage.getItem('studentos-kaito-animation') || 'auto')
  const motionEnabled = motionPreference === 'on' || (motionPreference === 'auto' && !prefersReducedMotion)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setPrefersReducedMotion(preference.matches)
    preference.addEventListener('change', updateMotion)
    return () => preference.removeEventListener('change', updateMotion)
  }, [])

  useEffect(() => {
    if (!motionEnabled || interacting || open) return undefined
    let startTimer
    let stopTimer
    const beginWalk = () => {
      setAutoDirection(direction => direction === 'left' ? 'right' : 'left')
      setAutoWalking(true)
      stopTimer = window.setTimeout(() => {
        setAutoWalking(false)
        startTimer = window.setTimeout(beginWalk, 4200)
      }, 1500)
    }
    startTimer = window.setTimeout(beginWalk, 900)
    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(stopTimer)
    }
  }, [motionEnabled, interacting, open])

  const moving = motionEnabled && (interacting || autoWalking)

  useEffect(() => {
    if (!moving) return undefined
    setFrame(0)
    const timer = window.setInterval(() => setFrame(current => (current + 1) % 4), 150)
    return () => window.clearInterval(timer)
  }, [moving])

  useEffect(() => {
    if (!open) return undefined
    const timer = window.setInterval(() => setNow(new Date()), 60000)
    const closeOnEscape = event => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const today = dateKey(now)
  const currentTime = now.toTimeString().slice(0, 5)
  const nextClass = courseSessions(workspace.courses, today)
    .filter(item => item.end > currentTime)
    .sort((a, b) => a.start.localeCompare(b.start))[0]
  const tasksDue = workspace.tasks.filter(item => item.dueDate === today && item.status !== 'done').length
  const direction = interacting ? open ? 'left' : 'right' : autoWalking ? autoDirection : open ? 'left' : 'right'
  const sprite = hasSprite ? moving ? (direction === 'left' ? walkingLeft : walkingRight)[frame] : direction === 'left' ? idleLeft : idleRight : null

  function toggleMotion() {
    const next = motionEnabled ? 'off' : 'on'
    localStorage.setItem('studentos-kaito-animation', next)
    setMotionPreference(next)
    if (next === 'off') setAutoWalking(false)
  }

  return <div className={`assistant-widget${motionEnabled ? ' motion-enabled' : ''}`}>
    {open && <section className="assistant-panel" id="assistant-panel" aria-label="Kaito study companion">
      <div className="assistant-panel-heading">
        <div><strong>Kaito</strong><span>Study companion</span></div>
        <button type="button" className="assistant-close" aria-label="Close Kaito" onClick={() => setOpen(false)}>×</button>
      </div>
      <div className="assistant-panel-body">
        <p className="assistant-eyebrow">TODAY AT A GLANCE</p>
        <div className="assistant-summary">
          <span>{nextClass ? nextClass.start <= currentTime ? 'In class now' : 'Next class' : 'Classes'}</span>
          <strong>{nextClass ? nextClass.title : 'No more classes today'}</strong>
          {nextClass && <small>{nextClass.start}–{nextClass.end}{nextClass.location ? ` · ${nextClass.location}` : ''}</small>}
        </div>
        <div className="assistant-summary">
          <span>Tasks due today</span>
          <strong>{tasksDue === 0 ? 'All caught up' : `${tasksDue} ${tasksDue === 1 ? 'task' : 'tasks'} left`}</strong>
        </div>
        <div className="assistant-links">
          <Link to="/courses" onClick={() => setOpen(false)}>Courses</Link>
          <Link to="/tasks" onClick={() => setOpen(false)}>Tasks</Link>
        </div>
        <p className="assistant-ai-note">AI chat is being prepared.</p>
        <button type="button" className="assistant-motion" aria-pressed={motionEnabled} onClick={toggleMotion}>{motionEnabled ? 'Pause animation' : 'Play animation'}</button>
      </div>
    </section>}
    <button
      type="button"
      className="assistant-trigger"
      aria-label={open ? 'Close Kaito study companion' : 'Open Kaito study companion'}
      aria-expanded={open}
      aria-controls={open ? 'assistant-panel' : undefined}
      onClick={() => { setNow(new Date()); setAutoWalking(false); setOpen(value => !value) }}
      onPointerEnter={event => { if (event.pointerType === 'mouse') { setAutoWalking(false); setInteracting(true) } }}
      onPointerLeave={() => setInteracting(false)}
      onFocus={event => { if (event.currentTarget.matches(':focus-visible')) { setAutoWalking(false); setInteracting(true) } }}
      onBlur={() => setInteracting(false)}
    >
      {sprite
        ? <img className={`assistant-sprite ${moving ? 'is-walking' : ''}`} src={sprite} width="88" height="88" alt="" draggable="false" />
        : <span className={`assistant-sprite assistant-sprite-fallback ${moving ? 'is-walking' : ''}`} aria-hidden="true">K</span>}
      <span className="assistant-trigger-dot" aria-hidden="true" />
    </button>
  </div>
}
