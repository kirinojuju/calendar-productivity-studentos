import { Route, Routes } from 'react-router'
import PlaceholderPage from '../pages/PlaceholderPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderPage />} />
    </Routes>
  )
}
