import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import CourseEditor from '../components/CourseEditor.jsx'
import Icon from '../components/Icon.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const weekOrder = [1, 2, 3, 4, 5, 6, 0]

export default function AcademicPage() {
  const { workspace, actions } = useWorkspace()
  const location = useLocation()
  const navigate = useNavigate()
  const editId = new URLSearchParams(location.search).get('edit')
  const initiallyEditing = workspace.courses.find(course => course.id === editId)
  const [selectedId, setSelectedId] = useState(initiallyEditing?.id || workspace.courses[0]?.id || '')
  const [editing, setEditing] = useState(initiallyEditing || null)
  const [creating, setCreating] = useState(false)

  const selected = workspace.courses.find(course => course.id === selectedId) || workspace.courses[0]
  const assignments = workspace.tasks.filter(task => task.courseId === selected?.id)
  const openAssignments = assignments.filter(task => task.status !== 'done')
  const schedule = workspace.courses
    .flatMap(course => (course.schedule || []).map(slot => ({ ...slot, course })))
    .sort((first, second) => first.day - second.day || first.start.localeCompare(second.start))

  function closeEditor() {
    setEditing(null)
    setCreating(false)
    if (location.search) navigate('/courses', { replace: true })
  }

  function saveCourse(form) {
    if (editing) actions.updateCourse(editing.id, form)
    else setSelectedId(actions.addCourse(form))
    closeEditor()
  }

  function deleteCourse() {
    actions.deleteCourse(editing.id)
    setSelectedId('')
    closeEditor()
  }

  function editCourse(course) {
    setSelectedId(course.id)
    setEditing(course)
  }

  return (
    <div className="module-page academic-page">
      <div className="module-heading">
        <div>
          <span className="eyebrow">YOUR STUDY SPACE</span>
          <h1>Courses</h1>
          <p>Manage your courses and weekly class schedule.</p>
        </div>
        <button className="primary-button" onClick={() => setCreating(true)}>
          <Icon name="plus" size={15} /> New course
        </button>
      </div>

      <div className="academic-layout">
        <aside className="course-list">
          <h2>Courses <span>{workspace.courses.length}</span></h2>
          {workspace.courses.map(course => (
            <button key={course.id}
              className={`course-list-item ${course.id === selected?.id ? 'active' : ''}`}
              onClick={() => setSelectedId(course.id)}>
              <span className={`course-color ${course.color}`} />
              <span><strong>{course.code}</strong><small>{course.name}</small></span>
            </button>
          ))}
        </aside>

        <div className="academic-main">
          <section className="academic-card">
            <div className="academic-card-head">
              <div>
                <span className="eyebrow">COURSE WORKSPACE</span>
                <h2>{selected?.name || 'Add a course to begin'}</h2>
                {selected && (
                  <p>{selected.code} · {selected.instructor || 'Instructor not set'}</p>
                )}
                {selected && (selected.startDate || selected.endDate) && (
                  <p className="course-date-range">
                    Course dates: {selected.startDate || 'Any time'} – {selected.endDate || 'Ongoing'}
                  </p>
                )}
              </div>
              {selected && (
                <button className="secondary-button" onClick={() => editCourse(selected)}>
                  Edit course
                </button>
              )}
            </div>

            {selected && (
              <div className="course-detail-grid">
                <div>
                  <div className="course-detail-title">
                    <strong>Class times</strong>
                    <button className="text-button" onClick={() => editCourse(selected)}>
                      Edit schedule
                    </button>
                  </div>
                  {(selected.schedule || []).length > 0 ? (
                    selected.schedule.map((slot, index) => (
                      <button key={index} type="button" className="course-time-row"
                        onClick={() => editCourse(selected)}
                        aria-label={`Edit ${days[slot.day]} ${slot.start} to ${slot.end}`}>
                        <span>{days[slot.day]}</span>
                        <strong>{slot.start}–{slot.end}</strong>
                        <span>{slot.room || 'Room TBD'}</span>
                      </button>
                    ))
                  ) : (
                    <p>No class times yet.</p>
                  )}
                </div>
                <div>
                  <strong>Assignments</strong>
                  <p>{openAssignments.length} open · {assignments.length} total</p>
                  <Link to={`/tasks?view=assignments&course=${encodeURIComponent(selected.id)}`}>
                    Open assignments →
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="academic-card">
            <div className="academic-card-head">
              <div>
                <span className="eyebrow">WEEKLY TIMETABLE</span>
                <h2>Class schedule</h2>
                <p>Select a class time to edit it.</p>
              </div>
              <Link className="text-button" to="/calendar">View calendar →</Link>
            </div>
            <div className="timetable">
              {weekOrder.map(day => {
                const dayClasses = schedule.filter(slot => slot.day === day)
                return (
                  <div className="timetable-day" key={day}>
                    <strong>{days[day]}</strong>
                    {dayClasses.map((slot, index) => (
                      <button type="button"
                        className={`timetable-session ${slot.course.color}`}
                        key={`${slot.course.id}-${index}`}
                        onClick={() => editCourse(slot.course)}
                        aria-label={`Edit ${slot.course.code} on ${days[day]} at ${slot.start}`}>
                        <span>{slot.start}–{slot.end}</span>
                        <b>{slot.course.code}</b>
                        <small>{slot.room || 'Room TBD'}</small>
                      </button>
                    ))}
                    {dayClasses.length === 0 && <span className="no-class">No classes</span>}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>

      {(creating || editing) && (
        <CourseEditor key={editing?.id || 'new'} course={editing}
          onSave={saveCourse} onClose={closeEditor} onDelete={deleteCourse} />
      )}
    </div>
  )
}
