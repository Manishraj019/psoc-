import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth pages
import AdminLogin from './pages/AdminLogin'
import TeamRegister from './pages/TeamRegister'
import TeamLogin from './pages/TeamLogin'

// Admin pages
import AdminDashboard from './pages/AdminDashboard'
import AdminLevelManager from './pages/AdminLevelManager'
import AdminSubmissions from './pages/AdminSubmissions'
import AdminLeaderboard from './pages/AdminLeaderboard'

// Team pages
import TeamDashboard from './pages/TeamDashboard'
import TeamLevel from './pages/TeamLevel'
import SubmissionStatus from './pages/SubmissionStatus'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/team/register" element={<TeamRegister />} />
            <Route path="/team/login" element={<TeamLogin />} />
            
            {/* Admin protected routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                
                  <AdminDashboard />
                
              </ProtectedRoute>
            } />
            <Route path="/admin/levels" element={
              <ProtectedRoute allowedRoles={['admin']}>
                
                  <AdminLevelManager />
                
              </ProtectedRoute>
            } />
            <Route path="/admin/submissions" element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSubmissions />
              </ProtectedRoute>
            } />
            <Route path="/admin/leaderboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLeaderboard />
              </ProtectedRoute>
            } />
            
            {/* Team protected routes */}
            <Route path="/team" element={
              <ProtectedRoute allowedRoles={['team']}>
                  <TeamDashboard />
              </ProtectedRoute>
            } />
            <Route path="/team/level" element={
              <ProtectedRoute allowedRoles={['team']}>
                  <TeamLevel />
              </ProtectedRoute>
            } />
            <Route path="/team/submission-status" element={
              <ProtectedRoute allowedRoles={['team']}>
                  <SubmissionStatus />
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/team/login" replace />} />
            <Route path="*" element={<Navigate to="/team/login" replace />} />
          </Routes>
        </div>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
