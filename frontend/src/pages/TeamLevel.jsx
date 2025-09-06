import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { teamService } from '../services/teamService'
import { Camera, Upload, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const TeamLevel = () => {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const data = await teamService.getProgress()
      setProgress(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
      toast.error('Failed to load level data')
    }
  }

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select an image to submit')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await teamService.submitImage(selectedFile)
      
      if (result.status === 'approved') {
        toast.success(result.message)
        setSelectedFile(null)
        setPreview(null)
        fetchProgress()
      } else {
        toast('Submission sent for review', { icon: '⏳' })
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast.error(error.response?.data?.error || 'Failed to submit image')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!progress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Level {progress.currentLevel}</h1>
        <p className="text-gray-600">Submit your photo for this level</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reference Image */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reference Image</h2>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={`http://localhost:4000${progress.assignedImage.url}`}
              alt="Reference"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Hint</h3>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {progress.assignedImage.hint}
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Photo</h2>
          
          {!preview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-primary-600">Drop the image here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop an image here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: JPEG, PNG, GIF, BMP, WebP (max 10MB)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Change Image
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> Your photo will be automatically compared with the reference image. 
                  If the similarity score is high enough, it will be auto-approved. Otherwise, it will be sent for manual review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamLevel
