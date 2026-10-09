import { useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import BudgetSummary from '../components/BudgetSummary.jsx'
import PlanSection from '../components/PlanSection.jsx'
import TodayClasses from '../components/TodayClasses.jsx'
import Icon from '../components/Icon.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { dateKey, shortDate } from '../utils/dates.js'

export default function TodayPage() {
  const { selectedDate } = useOutletContext()
  const { workspace, actions } = useWorkspace()
  const [quickAdd, setQuickAdd] = useState('')
  const [routineDraft, setRoutineDraft] = useState({ title: '', time: '07:00' })
  const today = dateKey(new Date())
  const isToday = selectedDate === today
  const routine = isToday
    ? workspace.routine.map(item => ({
        ...item,
        done: item.completedOn === today,
        detail: item.time,
      }))
    : []

  const todaysTasks = workspace.tasks.filter(task => task.dueDate === selectedDate)
  const tasks = todaysTasks
    .filter(task => !task.project?.toLowerCase().includes('study app'))
    .map(task => ({
      ...task,
      done: task.status === 'done',
      detail: task.courseId
        ? workspace.courses.find(course => course.id === task.courseId)?.code
        : task.priority === 'high' ? 'Important' : '',
    }))
  const projectTasks = todaysTasks
    .filter(task => task.project?.toLowerCase().includes('study app'))
    .map(task => ({
      ...task,
      done: task.status === 'done',
      detail: task.important ? 'Important' : '',
    }))

  function addTask(event) {
    event.preventDefault()
    if (!quickAdd.trim()) return
    actions.addTask({ title: quickAdd.trim(), dueDate: selectedDate })
    setQuickAdd('')
  }

  function addRoutine(event) {
    event.preventDefault()
    if (!routineDraft.title.trim()) return
    actions.addRoutine({ title: routineDraft.title.trim(), time: routineDraft.time })
    setRoutineDraft(current => ({ ...current, title: '' }))
  }

  function toggleTask(item) {
    actions.updateTask(item.id, { status: item.done ? 'todo' : 'done' })
  }

  return (
    <div className="main-content">
      <div className="overview">
        <div>
          <h1>{isToday ? "Today's Plan" : `Plan for ${shortDate(selectedDate)}`}</h1>
          <p>Stay organized. Progress today builds the future you want.</p>
        </div>
        <Link className="budget-link" to="/finance"><BudgetSummary /></Link>
      </div>

      <TodayClasses courses={workspace.courses} selectedDate={selectedDate} isToday={isToday} />
      <div className="plan-sections">
        {isToday && (
          <>
            <PlanSection title="Routine" icon="sun" items={routine}
              onToggle={item => actions.toggleRoutine(item.id, today)}
              onDelete={item => actions.deleteRoutine(item.id)} />
            <form className="routine-add" onSubmit={addRoutine}>
              <input aria-label="New routine" placeholder="Add a daily routine..."
                value={routineDraft.title}
                onChange={event => setRoutineDraft(current => ({ ...current, title: event.target.value }))} />
              <input aria-label="Routine time" type="time" value={routineDraft.time}
                onChange={event => setRoutineDraft(current => ({ ...current, time: event.target.value }))} />
              <button type="submit">Add</button>
            </form>
          </>
        )}
        <PlanSection title="Tasks" icon="document" items={tasks} onToggle={toggleTask} />
        <PlanSection title="Projects" icon="rocket" items={projectTasks} onToggle={toggleTask} />
      </div>
      <form className="quick-add" onSubmit={addTask}>
        <Icon name="plus" size={15} />
        <input aria-label="Add a task" placeholder="Add a task for this day..."
          value={quickAdd} onChange={event => setQuickAdd(event.target.value)} />
        <button type="submit">Add</button>
      </form>
    </div>
  )
}
