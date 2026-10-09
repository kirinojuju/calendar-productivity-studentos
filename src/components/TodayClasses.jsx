import { Link } from 'react-router'
import { courseSessions, shortDate } from '../utils/dates.js'

export default function TodayClasses({ courses, selectedDate, isToday }) {
  const courseById = new Map(courses.map(course => [course.id, course]))
  const sessions = courseSessions(courses, selectedDate).sort((a, b) => a.start.localeCompare(b.start))

  return (
    <section className="today-classes" aria-labelledby="today-classes-heading">
      <div className="today-classes-heading">
        <div>
          <span className="today-classes-eyebrow">CLASS SCHEDULE</span>
          <h2 id="today-classes-heading">
            {isToday ? "Today's classes" : `Classes · ${shortDate(selectedDate)}`}
          </h2>
        </div>
        <Link to="/courses">Manage courses →</Link>
      </div>
      {sessions.length > 0 ? (
        <div className="today-class-list">
          {sessions.map(session => {
            const course = courseById.get(session.courseId)
            return (
              <div className="today-class" key={session.id}>
                <span className={`today-class-color ${course?.color || 'orange'}`}
                  aria-hidden="true" />
                <div className="today-class-info">
                  <strong>{session.title}</strong>
                  <span>
                    {course?.code || 'Course'}
                    {session.location ? ` · ${session.location}` : ''}
                  </span>
                </div>
                <span className="today-class-time">{session.start}–{session.end}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="today-classes-empty">
          <p>{courses.length
            ? 'No classes scheduled for this day.'
            : 'Add your courses and weekly class times to see them here.'}</p>
          {!courses.length && <Link to="/courses">Add your first course →</Link>}
        </div>
      )}
    </section>
  )
}
