import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from './components/AuthGuard'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Capture } from './pages/Capture'
import { Findings } from './pages/Findings'
import { FindingDetail } from './pages/FindingDetail'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/findings" replace />} />
                    <Route path="/capture" element={<Capture />} />
                    <Route path="/findings" element={<Findings />} />
                    <Route path="/findings/:id" element={<FindingDetail />} />
                  </Routes>
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
