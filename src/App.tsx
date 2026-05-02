import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import Layout from './components/Layout'
import Login from './pages/Login'
import Capture from './pages/Capture'

function App() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGuard><Layout /></AuthGuard>}>
          <Route index element={<Navigate to="/findings" replace />} />
          <Route path="capture" element={<Capture />} />
          <Route path="findings" element={<PlaceholderPage title="Findings" subtitle="Sprint 1 ST-005 will land here." />} />
          <Route path="findings/:id" element={<PlaceholderPage title="Finding detail" subtitle="Sprint 1 ST-005 will land here." />} />
          <Route path="reports" element={<PlaceholderPage title="Reports" subtitle="Sprint 1 ST-006 will land here." />} />
        </Route>
      </Routes>
    </div>
  )
}

function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-ink mb-2">{title}</h1>
      <p className="text-muted">{subtitle}</p>
    </div>
  )
}

export default App
