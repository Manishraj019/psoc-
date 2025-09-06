import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { teamService } from '../services/teamService'
import { Camera, Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const TeamDashboard = () => {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const data = await teamService.getProgress()
      setProgress(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setIsLoading(false)
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
        <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.teamName}!</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Camera className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Level</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress?.currentLevel || 1}
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
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress?.completedLevels || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Trophy className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Levels</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress?.totalLevels || 9}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Level Card */}
      {progress?.assignedImage && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Level {progress.currentLevel}
            </h2>
            <span className="badge badge-info">
              {progress.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reference Image</h3>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${progress.assignedImage.url}`}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Hint</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {progress.assignedImage.hint}
                </p>
              </div>

              {progress.assignedImage.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">
                    {progress.assignedImage.description}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Aim for the same object, similar angle or composition. 
                      Location doesn't matter - only visual similarity counts!
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/team/level"
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Camera className="h-5 w-5" />
                <span>Submit Photo</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Team Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Team Leader</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">{user?.leader?.name}</p>
              <p className="text-sm text-gray-600">{user?.leader?.contact}</p>
              <p className="text-sm text-gray-600">Roll: {user?.leader?.rollNo}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Team Members</h3>
            <div className="space-y-2">
              {user?.members?.map((member, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">Roll: {member.rollNo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamDashboard
