import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Minus, Users, Lock, User, Phone, Hash } from 'lucide-react'

const TeamRegister = () => {
  const [formData, setFormData] = useState({
    teamName: '',
    password: '',
    confirmPassword: '',
    leader: {
      name: '',
      contact: '',
      rollNo: '',
    },
    members: [{ name: '', rollNo: '' }],
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('leader.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        leader: {
          ...formData.leader,
          [field]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.members]
    newMembers[index][field] = value
    setFormData({
      ...formData,
      members: newMembers,
    })
  }

  const addMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { name: '', rollNo: '' }],
    })
  }

  const removeMember = (index) => {
    if (formData.members.length > 1) {
      const newMembers = formData.members.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        members: newMembers,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (formData.members.some(member => !member.name || !member.rollNo)) {
      alert('All members must have name and roll number')
      return
    }

    setIsLoading(true)

    try {
      await register({
        teamName: formData.teamName,
        password: formData.password,
        leader: formData.leader,
        members: formData.members,
      })
      navigate('/team/login')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Register Your Team
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the Photo Marathon competition
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team Information</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                  Team Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="teamName"
                    name="teamName"
                    type="text"
                    required
                    value={formData.teamName}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter team name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="Enter password"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Leader */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team Leader</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="leader.name" className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="leader.name"
                    name="leader.name"
                    type="text"
                    required
                    value={formData.leader.name}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Leader name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="leader.contact" className="block text-sm font-medium text-gray-700">
                  Contact *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="leader.contact"
                    name="leader.contact"
                    type="tel"
                    required
                    value={formData.leader.contact}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="leader.rollNo" className="block text-sm font-medium text-gray-700">
                  Roll Number *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="leader.rollNo"
                    name="leader.rollNo"
                    type="text"
                    required
                    value={formData.leader.rollNo}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Roll number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
              <button
                type="button"
                onClick={addMember}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Member</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.members.map((member, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Member {index + 1} Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        className="input"
                        placeholder="Member name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={member.rollNo}
                        onChange={(e) => handleMemberChange(index, 'rollNo', e.target.value)}
                        className="input"
                        placeholder="Roll number"
                      />
                    </div>
                  </div>
                  {formData.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="p-2 text-danger-600 hover:text-danger-800"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Link to="/team/login" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Users className="h-5 w-5" />
                  <span>Register Team</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeamRegister
