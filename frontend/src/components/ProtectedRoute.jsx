import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userType, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page
    const loginPath = allowedRoles.includes('admin') ? '/admin/login' : '/team/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    // User doesn't have required role
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
