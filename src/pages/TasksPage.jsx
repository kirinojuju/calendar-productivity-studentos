import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'

const columns = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

function TaskEditor({ task, courses, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ title: task?.title || '', status: task?.status || 'todo', priority: task?.priority || 'medium', dueDate: task?.dueDate || '', important: !!task?.important, importantPoint: task?.importantPoint || '', project: task?.project || '', courseId: task?.courseId || '' })
  const change = (name, value) => setForm(current => ({ ...current, [name]: value }))
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><form className="editor-modal" role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'Create task'} onSubmit={e => { e.preventDefault(); onSave(form) }}><div className="modal-top"><h2>{task ? 'Edit task' : 'New task'}</h2><button type="button" className="plain-icon" aria-label="Close" onClick={onClose}><Icon name="close" /></button></div><label>Task title<input autoFocus required maxLength="160" value={form.title} onChange={e => change('title', e.target.value)} placeholder="What needs to be done?" /></label><div className="form-row"><label>Status<select value={form.status} onChange={e => change('status', e.target.value)}>{columns.map(column => <option key={column.id} value={column.id}>{column.label}</option>)}</select></label><label>Priority<select value={form.priority} onChange={e => change('priority', e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div><div className="form-row"><label>Due date<input type="date" value={form.dueDate} onChange={e => change('dueDate', e.target.value)} /></label><label>Course<select value={form.courseId} onChange={e => change('courseId', e.target.value)}><option value="">None</option>{courses.map(course => <option key={course.id} value={course.id}>{course.code}</option>)}</select></label></div><label>Project<input value={form.project} onChange={e => change('project', e.target.value)} placeholder="Optional project name" /></label><label className="checkbox-label"><input type="checkbox" checked={form.important} onChange={e => change('important', e.target.checked)} /> Mark as important</label><label>Important point<textarea rows="2" value={form.importantPoint} onChange={e => change('importantPoint', e.target.value)} placeholder="What deserves special attention?" /></label><div className="modal-actions">{task && <button type="button" className="danger-button" onClick={onDelete}>Delete</button>}<button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Save task</button></div></form></div>
}

export default function TasksPage() {
  const { workspace, actions } = useWorkspace()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')
  const [project, setProject] = useState('all')
  const [status, setStatus] = useState('')
  const projects = [...new Set(workspace.tasks.map(task => task.project).filter(Boolean))]
  const filtered = workspace.tasks.filter(task => (project === 'all' || task.project === project) && task.title.toLowerCase().includes(query.toLowerCase()))

  function saveTask(form) {
    if (editing) actions.updateTask(editing.id, form)
    else actions.addTask(form)
    setEditing(null); setCreating(false); setStatus('Task saved.')
  }
  function dropTask(event, column) {
    const id = event.dataTransfer.getData('text/studentos-task')
    if (!id) return
    event.preventDefault()
    actions.updateTask(id, { status: column })
    setStatus('Task moved.')
  }

  return <div className="module-page tasks-page"><div className="module-heading"><div><span className="eyebrow">WORK THAT MOVES FORWARD</span><h1>Tasks & projects</h1><p>Track coursework and personal projects in one board.</p></div><button className="primary-button" onClick={() => setCreating(true)}><Icon name="plus" size={15} /> New task</button></div><div className="task-toolbar"><input aria-label="Search tasks" placeholder="Search tasks..." value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Filter project" value={project} onChange={e => setProject(e.target.value)}><option value="all">All projects</option>{projects.map(name => <option key={name} value={name}>{name}</option>)}</select><span>{filtered.length} tasks</span></div>{status && <p className="inline-status" role="status">{status}</p>}<div className="task-board">{columns.map(column => <section className="task-column" key={column.id} onDragOver={e => { if (e.dataTransfer.types.includes('text/studentos-task')) e.preventDefault() }} onDrop={e => dropTask(e, column.id)}><div className="task-column-head"><h2>{column.label}</h2><span>{filtered.filter(task => task.status === column.id).length}</span></div><div className="task-cards">{filtered.filter(task => task.status === column.id).map(task => <article key={task.id} className="task-card" draggable onDragStart={e => e.dataTransfer.setData('text/studentos-task', task.id)}><div className="task-card-top"><span className={`priority-tag ${task.priority}`}>{task.priority}</span><button aria-label={`Edit ${task.title}`} className="plain-icon" onClick={() => setEditing(task)}><Icon name="edit" size={14} /></button></div><h3>{task.title}</h3>{task.importantPoint && <p className="important-point"><Icon name="star" size={13} />{task.importantPoint}</p>}<div className="task-meta">{task.important && <span className="important-tag">★ Important</span>}{task.dueDate && <span>{task.dueDate}</span>}{task.project && <span>{task.project}</span>}{task.courseId && <span>{workspace.courses.find(course => course.id === task.courseId)?.code}</span>}</div></article>)}{!filtered.some(task => task.status === column.id) && <p className="empty-column">Drop a task here</p>}</div></section>)}</div><p className="module-hint">Drag cards between columns. Open a card to edit its important point, due date, project, or course.</p>{(creating || editing) && <TaskEditor key={editing?.id || 'new'} task={editing} courses={workspace.courses} onSave={saveTask} onClose={() => { setEditing(null); setCreating(false) }} onDelete={() => { actions.deleteTask(editing.id); setEditing(null); setStatus('Task deleted.') }} />}</div>
}
