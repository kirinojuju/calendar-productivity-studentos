export function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function fromDateKey(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function shiftDate(value, days) {
  const date = fromDateKey(value)
  date.setDate(date.getDate() + days)
  return dateKey(date)
}

export function longDate(value) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(fromDateKey(value))
}

export function shortDate(value) {
  const date = fromDateKey(value)
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
  return `${weekday}, ${date.getDate()} ${month}`
}

export function monthCells(value) {
  const first = fromDateKey(value)
  const start = new Date(first.getFullYear(), first.getMonth(), 1)
  const offset = (start.getDay() + 6) % 7
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const length = Math.ceil((offset + lastDay) / 7) * 7
  return Array.from({ length }, (_, index) => dateKey(new Date(first.getFullYear(), first.getMonth(), index - offset + 1)))
}

export function courseSessions(courses, date) {
  const weekday = fromDateKey(date).getDay()
  return courses.flatMap(course => (course.startDate && date < course.startDate) || (course.endDate && date > course.endDate) ? [] : (course.schedule || [])
    .filter(slot => slot.day === weekday)
    .map(slot => ({ id: `${course.id}-${date}-${slot.start}`, title: course.name, date, start: slot.start, end: slot.end, location: slot.room, kind: 'class', courseId: course.id })))
}

export const formatMoney = amount => `฿${Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
