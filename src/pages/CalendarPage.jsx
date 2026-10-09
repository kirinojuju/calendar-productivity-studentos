import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router'
import CalendarMonth from '../components/CalendarMonth.jsx'
import Icon from '../components/Icon.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { courseSessions, dateKey, fromDateKey, monthCells, shiftDate, shortDate } from '../utils/dates.js'

const types = [
  { id: 'class', label: 'Classes' },
  { id: 'appointment', label: 'Appointments' },
  { id: 'reminder', label: 'Reminders' },
]

function EventEditor({ event, date, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    title: event?.title || '',
    kind: event?.kind || 'appointment',
    date: event?.date || date,
    start: event?.start || '09:00',
    end: event?.end || '10:00',
    location: event?.location || '',
    reminderMinutes: event?.reminderMinutes ?? 15,
    notes: event?.notes || '',
  })
  const [error, setError] = useState('')

  function change(key, value) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (form.end <= form.start) {
      setError('End time must be after start time.')
      return
    }
    onSave({ ...form, reminderMinutes: Number(form.reminderMinutes) })
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        className="editor-modal"
        role="dialog"
        aria-modal="true"
        aria-label={event ? 'Edit event' : 'Create event'}
        onSubmit={submit}
      >
        <div className="modal-top">
          <h2>{event ? 'Edit event' : 'New event'}</h2>
          <button type="button" className="plain-icon" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <label>
          Title
          <input autoFocus required maxLength="120" value={form.title}
            onChange={event => change('title', event.target.value)}
            placeholder="What is happening?" />
        </label>
        <div className="form-row">
          <label>
            Calendar
            <select value={form.kind} onChange={event => change('kind', event.target.value)}>
              <option value="appointment">Appointments</option>
              <option value="reminder">Reminders</option>
            </select>
          </label>
          <label>
            Date
            <input type="date" required value={form.date}
              onChange={event => change('date', event.target.value)} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Starts
            <input type="time" required value={form.start}
              onChange={event => change('start', event.target.value)} />
          </label>
          <label>
            Ends
            <input type="time" required value={form.end}
              onChange={event => change('end', event.target.value)} />
          </label>
        </div>
        <label>
          Location
          <input value={form.location} onChange={event => change('location', event.target.value)}
            placeholder="Optional" />
        </label>
        <label>
          Reminder
          <select value={form.reminderMinutes}
            onChange={event => change('reminderMinutes', event.target.value)}>
            <option value="0">None</option>
            <option value="5">5 minutes before</option>
            <option value="15">15 minutes before</option>
            <option value="30">30 minutes before</option>
            <option value="60">1 hour before</option>
          </select>
        </label>
        <label>
          Notes
          <textarea rows="3" value={form.notes} onChange={event => change('notes', event.target.value)}
            placeholder="Optional details" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          {event && <button type="button" className="danger-button" onClick={onDelete}>Delete</button>}
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit">Save event</button>
        </div>
      </form>
    </div>
  )
}

export default function CalendarPage() {
  const navigateTo = useNavigate()
  const { selectedDate, setSelectedDate } = useOutletContext()
  const { workspace, actions } = useWorkspace()
  const [view, setView] = useState('month')
  const [month, setMonth] = useState(dateKey(new Date(
    fromDateKey(selectedDate).getFullYear(),
    fromDateKey(selectedDate).getMonth(),
    1,
  )))
  const [visible, setVisible] = useState(['class', 'appointment', 'reminder'])
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [status, setStatus] = useState('')
  const pointerDrag = useRef(null)
  const suppressClick = useRef(false)

  const today = dateKey(new Date())
  const weekStart = useMemo(
    () => shiftDate(selectedDate, -((fromDateKey(selectedDate).getDay() + 6) % 7)),
    [selectedDate],
  )
  const viewDays = view === 'day'
    ? [selectedDate]
    : view === 'week'
      ? Array.from({ length: 7 }, (_, index) => shiftDate(weekStart, index))
      : monthCells(month)

  // Classes come from weekly course schedules. Appointments and reminders are saved events.
  const allEvents = useMemo(
    () => [...workspace.events, ...viewDays.flatMap(day => courseSessions(workspace.courses, day))],
    [workspace.events, workspace.courses, viewDays.join(',')],
  )
  const shownEvents = allEvents.filter(event => visible.includes(event.kind))

  function selectDay(day) {
    setSelectedDate(day)
    setMonth(dateKey(new Date(fromDateKey(day).getFullYear(), fromDateKey(day).getMonth(), 1)))
    if (view === 'month') setView('day')
  }

  function navigate(offset) {
    if (view === 'month') {
      setMonth(dateKey(new Date(fromDateKey(month).getFullYear(), fromDateKey(month).getMonth() + offset, 1)))
      return
    }
    const day = shiftDate(selectedDate, offset * (view === 'week' ? 7 : 1))
    setSelectedDate(day)
    setMonth(day)
  }

  function moveEvent(id, day) {
    const event = workspace.events.find(item => item.id === id)
    if (!event || event.date === day) return
    actions.updateEvent(id, { date: day })
    setStatus(`${event.title} moved to ${shortDate(day)}.`)
  }

  function saveEvent(form) {
    if (editing) actions.updateEvent(editing.id, form)
    else actions.addEvent(form)
    setEditing(null)
    setCreating(false)
    setStatus('Event saved.')
  }

  function closeEditor() {
    setEditing(null)
    setCreating(false)
  }

  function deleteEditingEvent() {
    actions.deleteEvent(editing.id)
    setEditing(null)
    setStatus('Event deleted.')
  }

  function clickEvent(event) {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    if (event.kind === 'class') navigateTo(`/courses?edit=${encodeURIComponent(event.courseId)}`)
    else setEditing(event)
  }

  // Mouse dragging uses the browser's drag and drop events. Pointer events handle touch.
  function pointerStart(event, id) {
    if (event.pointerType === 'mouse') return
    pointerDrag.current = { id, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function pointerEnd(event) {
    if (event.pointerType === 'mouse') return
    const drag = pointerDrag.current
    pointerDrag.current = null
    if (!drag || Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return

    const day = document.elementFromPoint(event.clientX, event.clientY)
      ?.closest('[data-calendar-date]')
      ?.getAttribute('data-calendar-date')
    if (day) moveEvent(drag.id, day)
    suppressClick.current = true
  }

  function dropOnDay(event, day) {
    const id = event.dataTransfer.getData('text/studentos-event')
    if (!id) return
    event.preventDefault()
    moveEvent(id, day)
  }

  function toggleFilter(id) {
    setVisible(current => current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id])
  }

  const periodLabel = view === 'month'
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(fromDateKey(month))
    : view === 'week'
      ? `Week of ${shortDate(weekStart)}`
      : shortDate(selectedDate)

  return (
    <div className="module-page calendar-page">
      <div className="module-heading">
        <div>
          <span className="eyebrow">PLAN YOUR TIME</span>
          <h1>Calendar</h1>
          <p>Classes, appointments, and reminders in one view.</p>
        </div>
        <button className="primary-button" onClick={() => setCreating(true)}>
          <Icon name="plus" size={15} /> New event
        </button>
      </div>

      <div className="calendar-toolbar">
        <div className="toolbar-left">
          <button className="secondary-button" onClick={() => { setSelectedDate(today); setMonth(today) }}>
            Today
          </button>
          <button className="plain-icon" aria-label="Previous period" onClick={() => navigate(-1)}>
            <Icon name="left" />
          </button>
          <button className="plain-icon" aria-label="Next period" onClick={() => navigate(1)}>
            <Icon name="right" />
          </button>
          <strong>{periodLabel}</strong>
        </div>
        <div className="view-switch" role="group" aria-label="Calendar view">
          {['month', 'week', 'day'].map(option => (
            <button key={option} className={view === option ? 'active' : ''}
              onClick={() => setView(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-filters">
        {types.map(type => (
          <label key={type.id}>
            <input type="checkbox" checked={visible.includes(type.id)}
              onChange={() => toggleFilter(type.id)} />
            <span className={`filter-dot ${type.id}`} />
            {type.label}
          </label>
        ))}
        <span className="drag-hint">Drag an appointment to another day, or edit its date.</span>
      </div>
      {status && <p className="inline-status" role="status">{status}</p>}

      {view === 'month' ? (
        <CalendarMonth
          month={month}
          selectedDate={selectedDate}
          onSelectDate={selectDay}
          events={shownEvents}
          groupClasses
          onMoveEvent={moveEvent}
          onEventClick={clickEvent}
          onPointerStart={pointerStart}
          onPointerEnd={pointerEnd}
        />
      ) : (
        <div className={`schedule-grid ${view}`}>
          {viewDays.map(day => {
            const dayEvents = shownEvents
              .filter(event => event.date === day)
              .sort((a, b) => a.start.localeCompare(b.start))

            return (
              <section
                key={day}
                data-calendar-date={day}
                className={`schedule-day ${day === today ? 'is-today' : ''}`}
                onDragOver={event => {
                  if (event.dataTransfer.types.includes('text/studentos-event')) event.preventDefault()
                }}
                onDrop={event => dropOnDay(event, day)}
              >
                <button className="schedule-day-heading"
                  onClick={() => { setSelectedDate(day); setView('day') }}>
                  {shortDate(day)}
                </button>
                <div className="schedule-items">
                  {dayEvents.map(event => (
                    <button
                      key={event.id}
                      className={`schedule-event ${event.kind}`}
                      draggable={event.kind !== 'class'}
                      onDragStart={dragEvent => {
                        if (event.kind !== 'class') {
                          dragEvent.dataTransfer.setData('text/studentos-event', event.id)
                        }
                      }}
                      onPointerDown={pointerEvent => {
                        if (event.kind !== 'class') pointerStart(pointerEvent, event.id)
                      }}
                      onPointerUp={pointerEvent => {
                        if (event.kind !== 'class') pointerEnd(pointerEvent)
                      }}
                      onClick={() => clickEvent(event)}
                    >
                      <span>{event.start}–{event.end}</span>
                      <strong>{event.title}</strong>
                      {event.location && <small>{event.location}</small>}
                    </button>
                  ))}
                  {dayEvents.length === 0 && <span className="empty-day">No events</span>}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <p className="calendar-footnote">
        Month view groups busy class days. Open a day to see each class time; select a class to edit its
        weekly schedule in <Link to="/courses">Courses</Link>.
      </p>
      {(creating || editing) && (
        <EventEditor
          key={editing?.id || 'new'}
          event={editing}
          date={selectedDate}
          onSave={saveEvent}
          onClose={closeEditor}
          onDelete={deleteEditingEvent}
        />
      )}
    </div>
  )
}
