import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'
import { CheckCircle, XCircle, Clock, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const data = await adminService.getPendingSubmissions()
      setSubmissions(data)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to load submissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (submissionId) => {
    try {
      await adminService.approveSubmission(submissionId, 'Approved by admin')
      toast.success('Submission approved')
      fetchSubmissions()
    } catch (error) {
      console.error('Error approving submission:', error)
      toast.error('Failed to approve submission')
    }
  }

  const handleReject = async (submissionId) => {
    try {
      await adminService.rejectSubmission(submissionId, 'Rejected by admin')
      toast.success('Submission rejected')
      fetchSubmissions()
    } catch (error) {
      console.error('Error rejecting submission:', error)
      toast.error('Failed to reject submission')
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
        <h1 className="text-2xl font-bold text-gray-900">Pending Submissions</h1>
        <p className="text-gray-600">Review and approve team submissions</p>
      </div>

      {submissions.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No pending submissions to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission._id} className="card">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Submitted Image */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Submitted Image</h3>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${submission.submittedImageUrl}`}
                      alt="Submission"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Reference Image */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Reference Image</h3>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${submission.assignedImageId.url}`}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {submission.teamId?.teamName} - Level {submission.levelNumber}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Similarity Score: {submission.similarityScore.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleReject(submission._id)}
                      className="btn btn-danger flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(submission._id)}
                      className="btn btn-success flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminSubmissions
