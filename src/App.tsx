import { Routes, Route } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import Layout from './components/Layout'
import Login from './pages/Login'

function App() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <AuthGuard>
            <Layout />
          </AuthGuard>
        } />
      </Routes>
    </div>
  )
}

export default App