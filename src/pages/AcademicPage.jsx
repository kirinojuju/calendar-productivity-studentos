import { useState } from 'react'
import { Link } from 'react-router'
import Icon from '../components/Icon.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const colors = ['orange', 'blue', 'green', 'purple']

function CourseEditor({ course, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ code: course?.code || '', name: course?.name || '', instructor: course?.instructor || '', color: course?.color || 'orange', schedule: course?.schedule || [{ day: 1, start: '09:00', end: '10:00', room: '' }] })
  const [error, setError] = useState('')
  const change = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const updateSlot = (index, patch) => change('schedule', form.schedule.map((slot, i) => i === index ? { ...slot, ...patch } : slot))
  function submit(e) {
    e.preventDefault()
    if (form.schedule.some(slot => slot.end <= slot.start)) { setError('Each class must end after it starts.'); return }
    onSave(form)
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><form className="editor-modal" role="dialog" aria-modal="true" aria-label={course ? 'Edit course' : 'Create course'} onSubmit={submit}><div className="modal-top"><h2>{course ? 'Edit course' : 'New course'}</h2><button type="button" className="plain-icon" aria-label="Close" onClick={onClose}><Icon name="close" /></button></div><div className="form-row"><label>Course code<input required maxLength="24" value={form.code} onChange={e => change('code', e.target.value)} placeholder="CS 110" /></label><label>Color<select value={form.color} onChange={e => change('color', e.target.value)}>{colors.map(color => <option key={color} value={color}>{color}</option>)}</select></label></div><label>Course name<input autoFocus required maxLength="100" value={form.name} onChange={e => change('name', e.target.value)} placeholder="Course name" /></label><label>Instructor<input value={form.instructor} onChange={e => change('instructor', e.target.value)} placeholder="Optional" /></label><div className="slot-title"><strong>Weekly classes</strong><button type="button" className="text-button" onClick={() => change('schedule', [...form.schedule, { day: 1, start: '09:00', end: '10:00', room: '' }])}>+ Add time</button></div>{form.schedule.map((slot, index) => <div className="course-slot-editor" key={index}><select aria-label={`Day for class ${index + 1}`} value={slot.day} onChange={e => updateSlot(index, { day: Number(e.target.value) })}>{days.map((day, i) => <option key={day} value={i}>{day}</option>)}</select><input aria-label={`Start for class ${index + 1}`} type="time" value={slot.start} onChange={e => updateSlot(index, { start: e.target.value })} /><input aria-label={`End for class ${index + 1}`} type="time" value={slot.end} onChange={e => updateSlot(index, { end: e.target.value })} /><input aria-label={`Room for class ${index + 1}`} placeholder="Room" value={slot.room} onChange={e => updateSlot(index, { room: e.target.value })} /><button type="button" aria-label={`Remove class ${index + 1}`} className="plain-icon" onClick={() => change('schedule', form.schedule.filter((_, i) => i !== index))}><Icon name="close" size={14} /></button></div>)}{error && <p className="form-error">{error}</p>}<div className="modal-actions">{course && <button type="button" className="danger-button" onClick={onDelete}>Delete course</button>}<button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Save course</button></div></form></div>
}

export default function AcademicPage() {
  const { workspace, actions } = useWorkspace()
  const [selectedId, setSelectedId] = useState(workspace.courses[0]?.id || '')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const selected = workspace.courses.find(course => course.id === selectedId) || workspace.courses[0]
  const assignments = workspace.tasks.filter(task => task.courseId === selected?.id)
  const schedule = workspace.courses.flatMap(course => course.schedule.map(slot => ({ ...slot, course }))).sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))

  function saveCourse(form) {
    if (editing) actions.updateCourse(editing.id, form)
    else actions.addCourse(form)
    setEditing(null); setCreating(false)
  }

  return <div className="module-page academic-page"><div className="module-heading"><div><span className="eyebrow">YOUR STUDY SPACE</span><h1>Academic</h1><p>Course details, weekly class times, and linked assignments.</p></div><button className="primary-button" onClick={() => setCreating(true)}><Icon name="plus" size={15} /> New course</button></div><div className="academic-layout"><aside className="course-list"><h2>Courses <span>{workspace.courses.length}</span></h2>{workspace.courses.map(course => <button key={course.id} className={`course-list-item ${course.id === selected?.id ? 'active' : ''}`} onClick={() => setSelectedId(course.id)}><span className={`course-color ${course.color}`} /><span><strong>{course.code}</strong><small>{course.name}</small></span></button>)}</aside><div className="academic-main"><section className="academic-card"><div className="academic-card-head"><div><span className="eyebrow">COURSE WORKSPACE</span><h2>{selected?.name || 'Add a course to begin'}</h2><p>{selected && `${selected.code} · ${selected.instructor || 'Instructor not set'}`}</p></div>{selected && <button className="secondary-button" onClick={() => setEditing(selected)}>Edit course</button>}</div>{selected && <div className="course-detail-grid"><div><strong>Class times</strong>{selected.schedule.length ? selected.schedule.map((slot, i) => <p key={i}>{days[slot.day]} · {slot.start}–{slot.end} · {slot.room || 'Room TBD'}</p>) : <p>No class times yet.</p>}</div><div><strong>Assignments</strong><p>{assignments.filter(task => task.status !== 'done').length} open · {assignments.length} total</p><Link to="/tasks">Open task board →</Link></div></div>}</section><section className="academic-card"><div className="academic-card-head"><div><span className="eyebrow">WEEKLY TIMETABLE</span><h2>Class schedule</h2></div><Link className="text-button" to="/calendar">View combined calendar →</Link></div><div className="timetable">{[1, 2, 3, 4, 5, 6, 0].map(day => <div className="timetable-day" key={day}><strong>{days[day]}</strong>{schedule.filter(slot => slot.day === day).map((slot, i) => <div className={`timetable-session ${slot.course.color}`} key={`${slot.course.id}-${i}`}><span>{slot.start}–{slot.end}</span><b>{slot.course.code}</b><small>{slot.room || 'Room TBD'}</small></div>)}{!schedule.some(slot => slot.day === day) && <span className="no-class">No classes</span>}</div>)}</div></section></div></div>{(creating || editing) && <CourseEditor key={editing?.id || 'new'} course={editing} onSave={saveCourse} onClose={() => { setEditing(null); setCreating(false) }} onDelete={() => { actions.deleteCourse(editing.id); setEditing(null); setSelectedId('') }} />}</div>
}
