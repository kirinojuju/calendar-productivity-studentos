import { useMemo } from 'react'
import { dateKey, fromDateKey, monthCells } from '../utils/dates.js'

const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function CalendarMonth({
  month,
  selectedDate,
  onSelectDate,
  events = [],
  compact = false,
  groupClasses = false,
  onMoveEvent,
  onEventClick,
  onPointerStart,
  onPointerEnd,
}) {
  const days = useMemo(() => monthCells(month), [month])
  const currentMonth = fromDateKey(month).getMonth()
  const today = dateKey(new Date())

  // Group events once so each day can look up only its own items.
  const eventsByDate = useMemo(() => {
    const grouped = new Map()
    for (const event of events) {
      const items = grouped.get(event.date) || []
      items.push(event)
      grouped.set(event.date, items)
    }
    return grouped
  }, [events])

  function allowEventDrop(event) {
    if (event.dataTransfer.types.includes('text/studentos-event')) event.preventDefault()
  }

  function dropEvent(event, day) {
    const id = event.dataTransfer.getData('text/studentos-event')
    if (!id) return
    event.preventDefault()
    onMoveEvent(id, day)
  }

  function startDrag(event, item) {
    if (item.kind === 'class' || item.kind === 'class-summary') return
    event.dataTransfer.setData('text/studentos-event', item.id)
  }

  return (
    <div className={`month-grid ${compact ? 'month-grid-compact' : 'month-grid-full'}`}>
      {weekdays.map(day => <span className="month-weekday" key={day}>{day}</span>)}
      {days.map(day => {
        const items = [...(eventsByDate.get(day) || [])]
          .sort((first, second) => first.start.localeCompare(second.start))
        const classes = groupClasses ? items.filter(item => item.kind === 'class') : []
        const classSummary = classes.length > 0
          ? {
              id: `classes-${day}`,
              date: day,
              start: classes[0].start,
              title: `${classes.length} ${classes.length === 1 ? 'class' : 'classes'}`,
              kind: 'class-summary',
              description: 'Open this day to see class names and times',
            }
          : null
        const displayItems = classSummary
          ? [classSummary, ...items.filter(item => item.kind !== 'class')]
          : items
        const outside = fromDateKey(day).getMonth() !== currentMonth

        return (
          <div
            key={day}
            data-calendar-date={day}
            className={`month-day ${outside ? 'outside' : ''} ${day === selectedDate ? 'selected' : ''} ${day === today ? 'is-today' : ''}`}
            onDragOver={onMoveEvent ? allowEventDrop : undefined}
            onDrop={onMoveEvent ? event => dropEvent(event, day) : undefined}
          >
            <button
              type="button"
              className="day-number"
              onClick={() => onSelectDate(day)}
              aria-label={new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(fromDateKey(day))}
            >
              {fromDateKey(day).getDate()}
            </button>

            {!compact && (
              <div className="month-events">
                {displayItems.slice(0, 3).map(item => {
                  const movable = item.kind !== 'class' && item.kind !== 'class-summary'
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`month-event ${item.kind}`}
                      draggable={movable}
                      onDragStart={event => startDrag(event, item)}
                      onPointerDown={event => movable && onPointerStart?.(event, item.id)}
                      onPointerUp={event => movable && onPointerEnd?.(event)}
                      onClick={() => item.kind === 'class-summary'
                        ? onSelectDate(day)
                        : onEventClick?.(item)}
                      title={item.description || `${item.start} ${item.title}`}
                    >
                      {item.kind === 'class-summary' ? item.title : `${item.start} ${item.title}`}
                    </button>
                  )
                })}
                {displayItems.length > 3 && (
                  <button type="button" className="more-events" onClick={() => onSelectDate(day)}>
                    +{displayItems.length - 3} more
                  </button>
                )}
              </div>
            )}
            {compact && items.length > 0 && <span className="event-dot" aria-hidden="true" />}
          </div>
        )
      })}
    </div>
  )
}
