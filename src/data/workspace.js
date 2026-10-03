import { dateKey, shiftDate } from '../utils/dates.js'

export const WORKSPACE_KEY = 'studentos-workspace-v2'

export function validateWorkspace(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  const arrays = ['courses', 'routine', 'tasks', 'events', 'notes']
  if (arrays.some(key => !Array.isArray(data[key]) || data[key].length > 10000)) return false
  if (!data.finance || typeof data.finance !== 'object' || Array.isArray(data.finance)) return false
  if (!Array.isArray(data.finance.transactions) || data.finance.transactions.length > 10000) return false
  for (const items of [...arrays.map(key => data[key]), data.finance.transactions]) {
    if (items.some(item => !item || typeof item !== 'object' || Array.isArray(item) || typeof item.id !== 'string' || item.id.length < 1 || item.id.length > 128)) return false
  }
  return true
}

export function createEmptyWorkspace() {
  const monthEnd = dateKey(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))
  return {
    courses: [], routine: [], tasks: [], events: [],
    finance: { openingBalance: 0, savingGoal: 0, periodEnd: monthEnd, transactions: [] },
    notes: [],
  }
}

export function createWorkspace() {
  const today = dateKey(new Date())
  const monthEnd = dateKey(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))
  const courses = [
    { id: 'calc', code: 'CALC 201', name: 'Calculus II', instructor: 'Dr. Taylor', color: 'orange', schedule: [{ day: 1, start: '09:00', end: '10:30', room: 'B204' }, { day: 3, start: '09:00', end: '10:30', room: 'B204' }] },
    { id: 'psy', code: 'PSY 101', name: 'Introduction to Psychology', instructor: 'Prof. Chen', color: 'blue', schedule: [{ day: 1, start: '11:00', end: '12:30', room: 'C120' }, { day: 4, start: '11:00', end: '12:30', room: 'C120' }] },
    { id: 'cs', code: 'CS 110', name: 'Computer Science Fundamentals', instructor: 'Dr. Morgan', color: 'green', schedule: [{ day: 1, start: '14:00', end: '15:30', room: 'A301' }, { day: 5, start: '14:00', end: '15:30', room: 'A301' }] },
  ]
  const routine = [
    { id: 'wake', title: 'Wake up & morning routine', time: '07:00', done: false },
    { id: 'breakfast', title: "Breakfast & review today's plan", time: '07:30', done: false },
    { id: 'workout', title: 'Quick workout (20 min)', time: '08:00', done: false },
    { id: 'campus', title: 'Get ready for campus', time: '08:30', done: false },
  ]
  const tasks = [
    { id: 'report', title: 'Finish lab report draft', status: 'todo', dueDate: today, priority: 'high', important: true, importantPoint: 'Finish the discussion section', courseId: 'cs', project: 'Coursework' },
    { id: 'chapter', title: 'Read Chapter 4: Memory and Learning', status: 'todo', dueDate: today, priority: 'medium', important: false, importantPoint: '', courseId: 'psy', project: 'Coursework' },
    { id: 'problem', title: 'Work on problem set 3', status: 'in_progress', dueDate: shiftDate(today, 2), priority: 'high', important: false, importantPoint: '', courseId: 'calc', project: 'Coursework' },
    { id: 'messages', title: 'Reply to group project messages', status: 'todo', dueDate: today, priority: 'low', important: false, importantPoint: '', courseId: '', project: 'Study app' },
    { id: 'homepage', title: 'Design homepage layout for study app', status: 'in_progress', dueDate: today, priority: 'medium', important: true, importantPoint: 'Finalize navigation', courseId: '', project: 'Study app' },
    { id: 'blog', title: 'Write 500 words for project blog', status: 'todo', dueDate: '', priority: 'low', important: false, importantPoint: '', courseId: '', project: 'Study app' },
    { id: 'research', title: 'Research competitor features', status: 'done', dueDate: '', priority: 'low', important: false, importantPoint: '', courseId: '', project: 'Study app' },
  ]
  const events = [
    { id: 'study', title: 'Study Time', date: today, start: '15:30', end: '16:30', kind: 'appointment', location: 'Library', notes: '', reminderMinutes: 15 },
    { id: 'meetup', title: 'Project Meetup', date: today, start: '17:00', end: '18:00', kind: 'appointment', location: 'Group 1 Meeting', notes: '', reminderMinutes: 30 },
    { id: 'reminder', title: 'Submit lab report', date: shiftDate(today, 1), start: '18:00', end: '18:15', kind: 'reminder', location: '', notes: '', reminderMinutes: 60 },
  ]
  return {
    courses, routine, tasks, events,
    finance: {
      openingBalance: 10000, savingGoal: 3000, periodEnd: monthEnd, transactions: [
        { id: 'coffee', title: 'Coffee and lunch', amount: 120, type: 'expense', date: today, category: 'Food' },
      ]
    },
    notes: [
      {
        id: 'week-notes', title: 'This week', updatedAt: today, blocks: [
          { id: 'welcome', type: 'heading', text: 'Focus for this week' },
          { id: 'plan', type: 'text', text: 'Review course notes, make progress on the study app, and keep the budget in view.' },
          { id: 'question', type: 'todo', text: 'Ask about the lab report deadline', checked: false },
        ]
      },
    ],
  }
}

export function loadWorkspace() {
  const initial = createWorkspace()
  try {
    const saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY))
    if (saved && Array.isArray(saved.tasks) && Array.isArray(saved.events)) return { ...initial, ...saved }
    const oldSections = JSON.parse(localStorage.getItem('studentos-today-v1'))
    if (Array.isArray(oldSections)) {
      const routine = oldSections.find(section => section.id === 'routine')?.items || []
      initial.routine = initial.routine.map(item => ({ ...item, done: !!routine.find(old => old.id === item.id)?.done }))
      const oldItems = oldSections.flatMap(section => section.items || [])
      initial.tasks = initial.tasks.map(task => ({ ...task, status: oldItems.find(old => old.id === task.id)?.done ? 'done' : task.status }))
      const added = oldSections.find(section => section.id === 'tasks')?.items?.filter(item => item.id?.startsWith('new-')) || []
      initial.tasks.push(...added.map(item => ({ id: item.id, title: item.title, status: item.done ? 'done' : 'todo', dueDate: dateKey(new Date()), priority: 'medium', important: false, importantPoint: '', courseId: '', project: '' })))
    }
    const oldFinance = JSON.parse(localStorage.getItem('studentos-finance-v1'))
    if (oldFinance && Number.isFinite(oldFinance.budget) && Number.isFinite(oldFinance.spent)) {
      initial.finance.openingBalance = Math.max(0, oldFinance.budget)
      initial.finance.savingGoal = 0
      initial.finance.periodEnd = dateKey(new Date())
      initial.finance.transactions = [{ id: 'legacy-spending', title: 'Earlier spending', amount: Math.max(0, oldFinance.spent), type: 'expense', date: dateKey(new Date()), category: 'Other' }]
    }
  } catch { return initial }
  return initial
}
