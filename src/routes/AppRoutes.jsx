import { Navigate, Route, Routes } from 'react-router'
import { WorkspaceProvider } from '../context/WorkspaceContext.jsx'
import AppShell from '../components/AppShell.jsx'
import TodayPage from '../pages/TodayPage.jsx'
import CalendarPage from '../pages/CalendarPage.jsx'
import TasksPage from '../pages/TasksPage.jsx'
import AcademicPage from '../pages/AcademicPage.jsx'
import FinancePage from '../pages/FinancePage.jsx'
import NotesPage from '../pages/NotesPage.jsx'

export default function AppRoutes() {
  return <WorkspaceProvider><Routes>
    <Route path="/" element={<AppShell />}>
      <Route index element={<TodayPage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="academic" element={<AcademicPage />} />
      <Route path="finance" element={<FinancePage />} />
      <Route path="notes" element={<NotesPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></WorkspaceProvider>
}
