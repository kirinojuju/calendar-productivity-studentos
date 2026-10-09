import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Icon from '../components/Icon.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'

const columns = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

function TaskEditor({ task, courses, assignment, initialCourseId, onSave, onDelete, onClose }) {
  const noun = assignment ? 'assignment' : 'task'
  const [form, setForm] = useState({
    title: task?.title || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate || '',
    important: !!task?.important,
    importantPoint: task?.importantPoint || '',
    project: task?.project || '',
    courseId: task?.courseId || initialCourseId || '',
  })

  function change(name, value) {
    setForm(current => ({ ...current, [name]: value }))
  }

  function submit(event) {
    event.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-backdrop" role="presentation"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <form className="editor-modal" role="dialog" aria-modal="true"
        aria-label={task ? `Edit ${noun}` : `Create ${noun}`} onSubmit={submit}>
        <div className="modal-top">
          <h2>{task ? `Edit ${noun}` : `New ${noun}`}</h2>
          <button type="button" className="plain-icon" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <label>
          {assignment ? 'Assignment' : 'Task'} title
          <input autoFocus required maxLength="160" value={form.title}
            onChange={event => change('title', event.target.value)}
            placeholder="What needs to be done?" />
        </label>
        <div className="form-row">
          <label>
            Status
            <select value={form.status} onChange={event => change('status', event.target.value)}>
              {columns.map(column => (
                <option key={column.id} value={column.id}>{column.label}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={event => change('priority', event.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Due date
            <input type="date" value={form.dueDate}
              onChange={event => change('dueDate', event.target.value)} />
          </label>
          <label>
            Course
            <select required={assignment && !task} value={form.courseId}
              onChange={event => change('courseId', event.target.value)}>
              <option value="">
                {assignment && !task ? 'Select a course' : 'None (general task)'}
              </option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code} · {course.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Project
          <input value={form.project} onChange={event => change('project', event.target.value)}
            placeholder="Optional project name" />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={form.important}
            onChange={event => change('important', event.target.checked)} />
          Mark as important
        </label>
        <label>
          Important point
          <textarea rows="2" value={form.importantPoint}
            onChange={event => change('importantPoint', event.target.value)}
            placeholder="What deserves special attention?" />
        </label>
        <div className="modal-actions">
          {task && <button type="button" className="danger-button" onClick={onDelete}>Delete</button>}
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">Save {noun}</button>
        </div>
      </form>
    </div>
  )
}

export default function TasksPage() {
  const { workspace, actions } = useWorkspace()
  const [searchParams, setSearchParams] = useSearchParams()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')
  const [project, setProject] = useState('all')
  const [status, setStatus] = useState('')

  const requestedView = searchParams.get('view')
  const view = ['general', 'assignments'].includes(requestedView) ? requestedView : 'all'
  const assignment = view === 'assignments'
  const noun = assignment ? 'assignment' : 'task'
  const course = searchParams.get('course') || 'all'
  const selectedCourse = workspace.courses.some(item => item.id === course) ? course : 'all'

  // An assignment is a task linked to a course.
  const visibleTasks = workspace.tasks.filter(task => {
    if (view === 'assignments') return Boolean(task.courseId)
    if (view === 'general') return !task.courseId
    return true
  })
  const projects = [...new Set(visibleTasks.map(task => task.project).filter(Boolean))]
  const filtered = visibleTasks.filter(task => {
    const matchesGroup = assignment
      ? selectedCourse === 'all' || task.courseId === selectedCourse
      : project === 'all' || task.project === project
    const matchesSearch = task.title.toLowerCase().includes(query.toLowerCase())
    return matchesGroup && matchesSearch
  })

  function changeView(nextView) {
    setSearchParams(nextView === 'all' ? {} : { view: nextView })
    setProject('all')
    setStatus('')
  }

  function saveTask(form) {
    if (editing) actions.updateTask(editing.id, form)
    else actions.addTask(form)
    setEditing(null)
    setCreating(false)
    setStatus(`${assignment ? 'Assignment' : 'Task'} saved.`)
  }

  function dropTask(event, column) {
    const id = event.dataTransfer.getData('text/studentos-task')
    if (!visibleTasks.some(task => task.id === id)) return
    event.preventDefault()
    actions.updateTask(id, { status: column })
    setStatus(`${assignment ? 'Assignment' : 'Task'} moved.`)
  }

  function closeEditor() {
    setEditing(null)
    setCreating(false)
  }

  function deleteEditingTask() {
    actions.deleteTask(editing.id)
    setEditing(null)
    setStatus(`${assignment ? 'Assignment' : 'Task'} deleted.`)
  }

  const initialCourseId = assignment
    ? selectedCourse === 'all' ? workspace.courses[0]?.id : selectedCourse
    : ''

  return (
    <div className="module-page tasks-page">
      <div className="module-heading">
        <div>
          <span className="eyebrow">WORK THAT MOVES FORWARD</span>
          <h1>Tasks & assignments</h1>
          <p>Keep personal projects and coursework together in one board.</p>
        </div>
        <button className="primary-button" disabled={assignment && !workspace.courses.length}
          onClick={() => setCreating(true)}>
          <Icon name="plus" size={15} /> New {noun}
        </button>
      </div>

      {assignment && !workspace.courses.length && (
        <p className="inline-status">
          Add a <Link to="/courses">course</Link> before creating an assignment.
        </p>
      )}
      <div className="task-view-switch" role="group" aria-label="Task category">
        {[
          ['all', 'All'],
          ['general', 'General tasks'],
          ['assignments', 'Assignments'],
        ].map(([option, label]) => (
          <button key={option} type="button" aria-pressed={view === option}
            className={view === option ? 'active' : ''} onClick={() => changeView(option)}>
            {label}
          </button>
        ))}
      </div>

      <div className="task-toolbar">
        <input aria-label="Search tasks" placeholder="Search tasks..." value={query}
          onChange={event => setQuery(event.target.value)} />
        {assignment ? (
          <select aria-label="Filter course" value={selectedCourse}
            onChange={event => setSearchParams(event.target.value === 'all'
              ? { view: 'assignments' }
              : { view: 'assignments', course: event.target.value })}>
            <option value="all">All courses</option>
            {workspace.courses.map(item => (
              <option key={item.id} value={item.id}>{item.code}</option>
            ))}
          </select>
        ) : (
          <select aria-label="Filter project" value={project}
            onChange={event => setProject(event.target.value)}>
            <option value="all">All projects</option>
            {projects.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        )}
        <span>
          {filtered.length} {assignment
            ? filtered.length === 1 ? 'assignment' : 'assignments'
            : filtered.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      {status && <p className="inline-status" role="status">{status}</p>}

      <div className="task-board">
        {columns.map(column => {
          const columnTasks = filtered.filter(task => task.status === column.id)
          return (
            <section className="task-column" key={column.id}
              onDragOver={event => {
                if (event.dataTransfer.types.includes('text/studentos-task')) event.preventDefault()
              }}
              onDrop={event => dropTask(event, column.id)}>
              <div className="task-column-head">
                <h2>{column.label}</h2>
                <span>{columnTasks.length}</span>
              </div>
              <div className="task-cards">
                {columnTasks.map(task => (
                  <article key={task.id} className="task-card" draggable
                    onDragStart={event => event.dataTransfer.setData('text/studentos-task', task.id)}>
                    <div className="task-card-top">
                      <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                      <button aria-label={`Edit ${task.title}`} className="plain-icon"
                        onClick={() => setEditing(task)}>
                        <Icon name="edit" size={14} />
                      </button>
                    </div>
                    <h3>{task.title}</h3>
                    {task.importantPoint && (
                      <p className="important-point">
                        <Icon name="star" size={13} />{task.importantPoint}
                      </p>
                    )}
                    <div className="task-meta">
                      {task.important && <span className="important-tag">★ Important</span>}
                      {task.dueDate && <span>{task.dueDate}</span>}
                      {task.project && <span>{task.project}</span>}
                      {task.courseId && (
                        <span>
                          {workspace.courses.find(item => item.id === task.courseId)?.code || 'Unknown course'}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
                {columnTasks.length === 0 && <p className="empty-column">No {noun}s here</p>}
              </div>
            </section>
          )
        })}
      </div>
      <p className="module-hint">
        Drag cards between columns. Choose a course to make an assignment; leave Course empty for a general task.
      </p>
      {(creating || editing) && (
        <TaskEditor key={editing?.id || 'new'} task={editing} courses={workspace.courses}
          assignment={Boolean(editing?.courseId) || assignment}
          initialCourseId={initialCourseId} onSave={saveTask} onClose={closeEditor}
          onDelete={deleteEditingTask} />
      )}
    </div>
  )
}
