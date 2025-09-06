import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminLevelManager = () => {
  const [levels, setLevels] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    try {
      const data = await adminService.getLevels()
      setLevels(data)
    } catch (error) {
      console.error('Error fetching levels:', error)
      toast.error('Failed to load levels')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Level Management</h1>
          <p className="text-gray-600">Manage game levels and reference images</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Level</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => (
          <div key={level._id} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Level {level.levelNumber}
              </h3>
              {level.isFinal && (
                <span className="badge badge-success">Final</span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Hint</h4>
                <p className="text-gray-900 text-sm">{level.hint}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Images</h4>
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {level.imagesPool.length} image(s)
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button className="btn btn-secondary flex-1 flex items-center justify-center space-x-1">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button className="btn btn-danger flex items-center justify-center">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminLevelManager
