import { useMemo } from 'react'
import { dateKey, fromDateKey, monthCells } from '../utils/dates.js'

const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function CalendarMonth({ month, selectedDate, onSelectDate, events = [], compact = false, groupClasses = false, onMoveEvent, onEventClick, onPointerStart, onPointerEnd }) {
  const days = useMemo(() => monthCells(month), [month])
  const currentMonth = fromDateKey(month).getMonth()
  const today = dateKey(new Date())
  const eventsByDate = useMemo(() => events.reduce((map, event) => {
    const list = map.get(event.date) || []
    list.push(event)
    map.set(event.date, list)
    return map
  }, new Map()), [events])

  return <div className={`month-grid ${compact ? 'month-grid-compact' : 'month-grid-full'}`}>
    {weekdays.map(day => <span className="month-weekday" key={day}>{day}</span>)}
    {days.map(day => {
      const items = [...(eventsByDate.get(day) || [])].sort((a, b) => a.start.localeCompare(b.start))
      const classes = groupClasses ? items.filter(item => item.kind === 'class') : []
      const classSummary = classes.length ? {
        id: `classes-${day}`,
        date: day,
        start: classes[0].start,
        title: `${classes.length} ${classes.length === 1 ? 'class' : 'classes'}`,
        kind: 'class-summary',
        description: 'Open this day to see class names and times',
      } : null
      const displayItems = classSummary ? [classSummary, ...items.filter(item => item.kind !== 'class')] : items
      const outside = fromDateKey(day).getMonth() !== currentMonth
      return <div data-calendar-date={day} className={`month-day ${outside ? 'outside' : ''} ${day === selectedDate ? 'selected' : ''} ${day === today ? 'is-today' : ''}`} key={day}
        onDragOver={onMoveEvent ? event => { if (event.dataTransfer.types.includes('text/studentos-event')) event.preventDefault() } : undefined}
        onDrop={onMoveEvent ? event => { const id = event.dataTransfer.getData('text/studentos-event'); if (id) { event.preventDefault(); onMoveEvent(id, day) } } : undefined}>
        <button type="button" className="day-number" onClick={() => onSelectDate(day)} aria-label={new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(fromDateKey(day))}>{fromDateKey(day).getDate()}</button>
        {!compact && <div className="month-events">{displayItems.slice(0, 3).map(item => <button key={item.id} type="button" draggable={item.kind !== 'class' && item.kind !== 'class-summary'} onDragStart={event => { if (item.kind !== 'class' && item.kind !== 'class-summary') event.dataTransfer.setData('text/studentos-event', item.id) }} onPointerDown={event => item.kind !== 'class' && item.kind !== 'class-summary' && onPointerStart?.(event, item.id)} onPointerUp={event => item.kind !== 'class' && item.kind !== 'class-summary' && onPointerEnd?.(event)} className={`month-event ${item.kind}`} onClick={() => item.kind === 'class-summary' ? onSelectDate(day) : onEventClick?.(item)} title={item.description || `${item.start} ${item.title}`}>{item.kind === 'class-summary' ? item.title : `${item.start} ${item.title}`}</button>)}{displayItems.length > 3 && <button type="button" className="more-events" onClick={() => onSelectDate(day)}>+{displayItems.length - 3} more</button>}</div>}
        {compact && items.length > 0 && <span className="event-dot" aria-hidden="true" />}
      </div>
    })}
  </div>
}
