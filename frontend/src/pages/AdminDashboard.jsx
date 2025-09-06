import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { adminService } from '../services/adminService'
import { 
  Users, 
  Camera, 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [gameState, setGameState] = useState(null)
  const [pendingSubmissions, setPendingSubmissions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [gameStateData, submissionsData, leaderboardData] = await Promise.all([
        adminService.getGameState(),
        adminService.getPendingSubmissions(),
        adminService.getLeaderboard()
      ])
      
      setGameState(gameStateData)
      setPendingSubmissions(submissionsData)
      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGameAction = async (action) => {
    try {
      let response
      switch (action) {
        case 'start':
          response = await adminService.startGame()
          break
        case 'pause':
          response = await adminService.pauseGame()
          break
        case 'reset':
          if (window.confirm('Are you sure you want to reset the game? This will clear all team progress.')) {
            response = await adminService.resetGame()
          } else {
            return
          }
          break
        default:
          return
      }
      
      toast.success(response.message)
      fetchDashboardData()
    } catch (error) {
      console.error(`Error ${action}ing game:`, error)
      toast.error(error.response?.data?.error || `Failed to ${action} game`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}!</p>
      </div>

      {/* Game Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Game Status</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${gameState?.isRunning ? 'bg-success-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              {gameState?.isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Started At</p>
            <p className="font-medium">
              {gameState?.startedAt 
                ? new Date(gameState.startedAt).toLocaleString()
                : 'Not started'
              }
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Winner</p>
            <p className="font-medium">
              {gameState?.winnerTeamId ? 'Declared' : 'None yet'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-medium">
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-4">
          <button
            onClick={() => handleGameAction('start')}
            disabled={gameState?.isRunning}
            className="btn btn-success flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Start Game</span>
          </button>
          <button
            onClick={() => handleGameAction('pause')}
            disabled={!gameState?.isRunning}
            className="btn btn-warning flex items-center space-x-2"
          >
            <Pause className="h-4 w-4" />
            <span>Pause Game</span>
          </button>
          <button
            onClick={() => handleGameAction('reset')}
            className="btn btn-danger flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Game</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaderboard.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Camera className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingSubmissions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Teams</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaderboard.filter(team => team.levelCompleted === 9).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-danger-100 rounded-lg">
              <Trophy className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Winner</p>
              <p className="text-2xl font-bold text-gray-900">
                {gameState?.winnerTeamId ? '🏆' : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Pending Submissions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Pending Submissions</h2>
          <Link to="/admin/submissions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pending submissions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSubmissions.slice(0, 5).map((submission) => (
              <div key={submission._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${submission.submittedImageUrl}`}
                      alt="Submission"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {submission.teamId?.teamName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Level {submission.levelNumber} • {submission.similarityScore.toFixed(1)}% similarity
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="badge badge-warning">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Teams */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Teams</h2>
          <Link to="/admin/leaderboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View Full Leaderboard
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No teams registered yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((team, index) => (
              <div key={team.teamId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{team.teamName}</p>
                    <p className="text-sm text-gray-600">
                      Level {team.levelCompleted} • {team.totalTimeFormatted}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {team.levelCompleted === 9 && (
                    <span className="badge badge-success">
                      <Trophy className="h-3 w-3 mr-1" />
                      Winner
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
