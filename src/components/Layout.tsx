import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { LogOut, Search, FileText, BarChart3 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Button } from './ui'

const Layout: React.FC = () => {
  const location = useLocation()
  const currentPath = location.pathname

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const navigation = [
    { name: 'Capture', href: '/capture', icon: Search },
    { name: 'Findings', href: '/findings', icon: FileText },
    { name: 'Reports', href: '/reports', icon: BarChart3 }
  ]

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <div className="w-64 bg-elev border-r border-border flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-xl font-bold text-ink">STANDSTILL</h1>
            <div className="w-2 h-2 bg-accent rounded-full"></div>
          </div>
          <p className="kicker">v1 · self-audit</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = currentPath.startsWith(item.href)
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-accent/20 text-accent border border-accent/30' 
                    : 'text-muted hover:text-ink hover:bg-elev/50'
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted hover:text-ink"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/findings" replace />} />
            <Route path="/capture" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Capture</h1>
                <p className="text-muted">Capture functionality coming soon...</p>
              </div>
            } />
            <Route path="/findings" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Findings</h1>
                <p className="text-muted">Findings dashboard coming soon...</p>
              </div>
            } />
            <Route path="/reports" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Reports</h1>
                <p className="text-muted">Reports dashboard coming soon...</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default Layout