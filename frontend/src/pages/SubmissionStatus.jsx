import { useState, useEffect } from 'react'
import { teamService } from '../services/teamService'
import { CheckCircle, XCircle, Clock, Camera } from 'lucide-react'

const SubmissionStatus = () => {
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const data = await teamService.getSubmissionHistory()
      setSubmissions(data)
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-danger-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-500" />
      default:
        return <Camera className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'badge badge-success'
      case 'rejected':
        return 'badge badge-danger'
      case 'pending':
        return 'badge badge-warning'
      default:
        return 'badge badge-info'
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submission History</h1>
        <p className="text-gray-600">View all your submitted photos and their status</p>
      </div>

      {submissions.length === 0 ? (
        <div className="card text-center py-12">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600">Start by submitting photos for your current level.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${submission.submittedImageUrl}`}
                      alt="Submission"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Level {submission.levelNumber}</h3>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Similarity Score: {submission.similarityScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(submission.status)}
                  <span className={getStatusBadge(submission.status)}>
                    {submission.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SubmissionStatus
