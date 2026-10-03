import { useState } from 'react'
import Icon from './Icon.jsx'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const colors = ['orange', 'blue', 'green', 'purple']
const newSlot = () => ({ day: 1, start: '09:00', end: '10:00', room: '' })

export default function CourseEditor({ course, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    code: course?.code || '',
    name: course?.name || '',
    instructor: course?.instructor || '',
    color: course?.color || 'orange',
    startDate: course?.startDate || '',
    endDate: course?.endDate || '',
    schedule: course?.schedule || [newSlot()],
  })
  const [error, setError] = useState('')

  const change = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const updateSlot = (index, patch) => setForm(current => ({
    ...current,
    schedule: current.schedule.map((slot, i) => i === index ? { ...slot, ...patch } : slot),
  }))

  function submit(event) {
    event.preventDefault()
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('Course end date must be on or after the start date.')
      return
    }
    if (form.schedule.some(slot => !slot.start || !slot.end || slot.end <= slot.start)) {
      setError('Each class must end after it starts.')
      return
    }
    onSave(form)
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <form className="editor-modal course-editor-modal" role="dialog" aria-modal="true" aria-label={course ? 'Edit course' : 'Create course'} onSubmit={submit}>
      <div className="modal-top">
        <h2>{course ? 'Edit course' : 'New course'}</h2>
        <button type="button" className="plain-icon" aria-label="Close" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div className="form-row">
        <label>Course code<input required maxLength="24" value={form.code} onChange={event => change('code', event.target.value)} placeholder="CS 110" /></label>
        <label>Color<select value={form.color} onChange={event => change('color', event.target.value)}>{colors.map(color => <option key={color} value={color}>{color}</option>)}</select></label>
      </div>
      <label>Course name<input autoFocus required maxLength="100" value={form.name} onChange={event => change('name', event.target.value)} placeholder="Course name" /></label>
      <label>Instructor<input value={form.instructor} onChange={event => change('instructor', event.target.value)} placeholder="Optional" /></label>
      <div className="course-editor-section">
        <div className="course-editor-section-heading"><strong>Course dates</strong><span>Only show classes within these dates</span></div>
        <div className="form-row">
          <label>Starts on<input type="date" value={form.startDate} onChange={event => change('startDate', event.target.value)} /></label>
          <label>Ends on<input type="date" min={form.startDate || undefined} value={form.endDate} onChange={event => change('endDate', event.target.value)} /></label>
        </div>
        <p className="course-editor-hint">Leave either date empty if the schedule has no start or end yet.</p>
      </div>
      <div className="course-editor-section">
        <div className="course-editor-section-heading"><strong>Weekly class times</strong><button type="button" className="text-button" onClick={() => change('schedule', [...form.schedule, newSlot()])}>+ Add class time</button></div>
        <p className="course-editor-hint">Choose the day, start and end time for each class. These repeat every week.</p>
        {form.schedule.map((slot, index) => <div className="course-slot-card" key={index}>
          <div className="course-slot-card-heading"><strong>Class time {index + 1}</strong><button type="button" className="course-slot-remove" onClick={() => change('schedule', form.schedule.filter((_, i) => i !== index))}>Remove</button></div>
          <div className="course-slot-fields">
            <label>Day<select value={slot.day} onChange={event => updateSlot(index, { day: Number(event.target.value) })}>{days.map((day, i) => <option key={day} value={i}>{day}</option>)}</select></label>
            <label>Starts<input type="time" required value={slot.start} onChange={event => updateSlot(index, { start: event.target.value })} /></label>
            <label>Ends<input type="time" required value={slot.end} onChange={event => updateSlot(index, { end: event.target.value })} /></label>
            <label>Room<input value={slot.room} onChange={event => updateSlot(index, { room: event.target.value })} placeholder="Optional" /></label>
          </div>
        </div>)}
        {!form.schedule.length && <p className="course-editor-hint">No class times yet. Add one when you know the schedule.</p>}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions">
        {course && <button type="button" className="danger-button" onClick={onDelete}>Delete course</button>}
        <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
        <button type="submit" className="primary-button">Save course</button>
      </div>
    </form>
  </div>
}
