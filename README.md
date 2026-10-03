# StudentOS

StudentOS is a student planning app with separate Today, Calendar, Tasks, Academic, Finance, and Notes pages. It uses a React/Vite frontend and a Node.js API backed by PostgreSQL. Each account has its own workspace; the server stores data in PostgreSQL, and the browser no longer uses local storage as the main database.

## Run locally

Requirements: Node.js 24+, npm, and Docker Desktop with its engine running. In Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked.

```sh
npm ci
npm run db:setup
docker compose up -d db
npm run db:migrate
npm run dev
```

`db:setup` writes a unique database password to the ignored `.env` file. It never overwrites an existing `.env`. PostgreSQL listens only on `127.0.0.1:5433` and stores data in the `studentos_postgres` Docker volume. Open the Vite URL (normally `http://127.0.0.1:5173/`), create an account with a password of at least 12 characters, and start with an empty workspace. Run `npm run dev` to start both the API on port 3001 and the Vite frontend. If port 5173 is occupied, stop the earlier Vite server before starting this command.

The account menu offers **Import data from this browser** when the account is empty and earlier prototype data exists in local storage. Import is optional. The old local copy stays in the browser; remove it using browser site storage controls after checking the import.

If PostgreSQL is unavailable, the connection screen offers **Preview on this device**. This explicitly uses browser local storage for interface testing and does not create an account or sync data. Once the database is running, refresh, create an account, and use the import button if you want to keep preview data.

## Build and verify

```sh
npm test
npm run build
npm run test:integration
npm run db:backup
```

The integration test needs a running PostgreSQL container and applied migration. It creates two temporary accounts, verifies isolation and persistence, then removes them. `npm start` serves the built frontend and API from the same origin; use an HTTPS reverse proxy and `NODE_ENV=production` for a public deployment so session cookies have the `Secure` attribute.

For a public origin, set `APP_ORIGIN` in `.env` to the exact HTTPS site origin before starting the API. Local Vite origins on port 5173 are accepted only outside production.

## Data and security

- `server/migrations/001_initial.sql` creates users, sessions, and versioned workspaces. Each workspace is one JSONB document scoped by the authenticated user's ID. This keeps the current connected pages consistent while allowing later migrations to normalized tables for module-level queries.
- Passwords use scrypt with a per-user random salt. Session cookies are HttpOnly, SameSite=Lax, and are Secure in production. The database stores only a hash of each session token. Session lifetime is seven days; sign out revokes the session.
- All workspace updates require the current version. If another tab or device has saved first, the app shows a conflict instead of silently replacing that data.
- The API checks same-origin writes, validates incoming workspace structure, limits request size, and uses parameterized SQL. PostgreSQL is bound to localhost in Compose.

The Docker volume survives container restarts, but it is **not a backup**. `npm run db:backup` writes a PostgreSQL custom-format dump to ignored `backups/`; copy it to a protected location on another device and verify a restore before depending on it. Public deployment also needs HTTPS, automated backups, monitoring, email verification/password recovery, and stronger shared rate limiting. The current login rate limit is per API process. No password reset, email delivery, AI finance analysis, receipt reading, or push notifications are included yet.

## Features

- **Today:** routine, classes, due tasks, agenda, and daily spending allowance.
- **Calendar:** month/week/day views, class/appointment/reminder filters, event editing, and dragging appointments or reminders to another day.
- **Tasks:** project board, drag between status columns, priority, important point, due date, course link, and project filter.
- **Academic:** courses and detailed weekly timetable; class sessions also appear in Calendar.
- **Finance:** starting money, savings goal, period end, transactions, and `(current balance - savings goal) / days remaining` daily allowance, floored at zero.
- **Notes:** pages with text, heading, and to-do blocks that can be edited, reordered, and linked to a course.

See [module boundaries](docs/product-modules.md) for how the pages share data.
