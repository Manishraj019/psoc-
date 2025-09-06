import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { 
  Home, 
  Camera, 
  Trophy, 
  Settings, 
  LogOut, 
  Users, 
  Image as ImageIcon,
  BarChart3,
  Wifi,
  WifiOff
} from 'lucide-react'

const Layout = () => {
  const { user, userType, logout } = useAuth()
  const { isConnected } = useSocket()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/team/login')
  }

  const getNavigationItems = () => {
    if (userType === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/levels', label: 'Levels', icon: ImageIcon },
        { path: '/admin/submissions', label: 'Submissions', icon: Camera },
        { path: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
      ]
    } else if (userType === 'team') {
      return [
        { path: '/team', label: 'Dashboard', icon: Home },
        { path: '/team/level', label: 'Current Level', icon: Camera },
        { path: '/team/submission-status', label: 'Submissions', icon: BarChart3 },
      ]
    }
    return []
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  📸 Photo Marathon
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-success-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-danger-500" />
                )}
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {userType === 'admin' ? user?.username : user?.teamName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {userType}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
