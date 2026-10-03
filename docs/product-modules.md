# StudentOS module boundaries

This document records the direction discussed after the first Today wireframe. The goal is one connected workspace with clear ownership of each kind of data.

| Area | Owns | Appears elsewhere |
| --- | --- | --- |
| Today | A daily summary and quick entry | Reads classes, events, tasks, routine, and finance |
| Calendar | Dated appointments and reminders; combined time views | Shows recurring class sessions from Academic |
| Tasks | Work items, status, priority, important points, and project grouping | Due tasks appear in Today and course assignments in Academic |
| Academic | Courses and their detailed weekly class schedule | Publishes class sessions to Calendar |
| Finance | Balances, savings goal, transactions, and daily allowance | Today shows the daily allowance |
| Notes | Flexible pages made from blocks | Notes can link to a course |

## Calendar and Academic

Calendar answers **when is it happening?** It combines class sessions, appointments, and reminders in month, week, and day views. Academic answers **what is this course?** It owns course details, rooms, instructors, weekly meeting times, and related assignments. Editing a class time in Academic changes the recurring sessions visible in Calendar. Moving an appointment in Calendar changes only that appointment.

## Tasks and projects

Projects are a grouping and workflow inside Tasks rather than a separate top-level page. A task may also link to a course. The board is the current home for project progress, priorities, and important points. Academic surfaces course-linked tasks without duplicating their records.

## Finance calculation

The current recommendation is:

```text
current balance = starting money + recorded income - recorded expenses
spendable money = max(0, current balance - savings goal)
days remaining = days from today through the chosen period end, inclusive
recommended daily amount = spendable money / max(1, days remaining)
```

This recalculates after each transaction. It is a planning number, not a guarantee that all future bills are covered. A later version should account for scheduled obligations.

## Later integrations

The present prototype keeps data in this browser. The next backend phase should add user accounts, a database, and syncing before relying on it for real records. AI financial analysis and receipt reading are deferred until an API connection is selected. Receipt processing should show the extracted amount, date, merchant, and category for user review before creating a transaction. Browser and phone push notifications for reminders are also a later phase; current reminders are visible inside the app.
