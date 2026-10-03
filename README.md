# StudentOS

StudentOS is a student planning app with separate Today, Calendar, Tasks, Courses, Finance, and Notes pages. It uses React/Vite, Firebase Authentication, and Cloud Firestore. Each account has a private workspace in Firestore. The earlier Node/PostgreSQL backend is retained in `server/` for reference, but the web app no longer calls it.

## Run locally

Requirements: Node.js 24+ and npm. In Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked.

```sh
npm ci
npm run dev
```

Before running, fill the `VITE_FIREBASE_*` settings listed in `.env.example` in a local `.env.local` file using your Firebase web app configuration. `.env.local` is ignored by Git. Open the Vite URL (normally `http://127.0.0.1:5173/`), create an account with a password of at least 12 characters, and start with an empty workspace. In Firebase Console, enable Authentication > Email/Password and publish the owner-only `firestore.rules` before using accounts. If port 5173 is occupied, stop the earlier Vite server before starting this command.

The account menu offers **Import data from this browser** when the account is empty and earlier prototype data exists in local storage. Import is optional. The old local copy stays in the browser; remove it using browser site storage controls after checking the import.

The sign-in and connection screens offer **Preview on this device**. This uses browser local storage for interface testing and does not create an account or sync data. Once Firebase is available, exit preview, create an account, and use the import button if you want to keep preview data.

## Build and verify

```sh
npm test
npm run build
```

`firebase.json` is configured for Firebase Hosting with `dist` as the public directory and an SPA rewrite. Build the app before deploying Hosting. Publishing Firestore rules and Hosting changes a live Firebase project, so review the destination and rules first.

Artwork in `assets_ai_assistance/`, `src/components/logo/`, and `public/` stays local and is ignored by Git. The app builds without those files; Kaito shows a simple fallback badge and favicon links are omitted. A production build that should include the custom artwork must be made on a machine that has those local files.

## Data and security

- Firebase Authentication handles email/password accounts. The browser reads and writes only `workspaces/{uid}` for the signed-in user.
- `firestore.rules` restricts access to the owner and checks document fields and version progression. It is a prototype ruleset that needs review before broad public use.
- The workspace is currently one JSON string in one document, capped by the app at 750,000 UTF-8 bytes. This preserves the existing UI and conflict detection but should be split into item documents as notes and transactions grow.
- If another tab or device has saved first, the app shows a conflict instead of silently replacing that data.

The earlier PostgreSQL accounts and data are not automatically moved to Firebase. Local preview data can be imported from the account menu. No AI finance analysis, receipt reading, or push notifications are included yet.

## Features

- **Today:** routine, classes, due tasks, agenda, and daily spending allowance.
- **Calendar:** month/week/day views, class/appointment/reminder filters, event editing, and dragging appointments or reminders to another day.
- **Tasks:** project board, drag between status columns, priority, important point, due date, course link, and project filter.
- **Courses:** course details and a weekly timetable; class sessions also appear in Calendar.
- **Finance:** starting money, savings goal, period end, transactions, and `(current balance - savings goal) / days remaining` daily allowance, floored at zero.
- **Notes:** pages with text, heading, and to-do blocks that can be edited, reordered, and linked to a course.
- **Kaito:** an animated sprite companion in the lower-right corner that shows today's next class and remaining due tasks. Motion follows the device preference, and the companion panel can play or pause it manually. AI chat is not connected yet.

See [module boundaries](docs/product-modules.md) for how the pages share data.
