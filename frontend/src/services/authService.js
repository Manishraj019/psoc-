import apiClient from './apiClient'

export const authService = {
  // Admin login
  async adminLogin(credentials) {
    const response = await apiClient.post('/auth/admin/login', credentials)
    return response.data
  },

  // Team registration
  async register(teamData) {
    const response = await apiClient.post('/auth/team/register', teamData)
    return response.data
  },

  // Team login
  async teamLogin(credentials) {
    const response = await apiClient.post('/auth/team/login', credentials)
    return response.data
  },

  // Generic login method
  async login(credentials, userType) {
    if (userType === 'admin') {
      return this.adminLogin(credentials)
    } else if (userType === 'team') {
      return this.teamLogin(credentials)
    }
    throw new Error('Invalid user type')
  },

  // Get current user info
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  // Logout
  async logout() {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },
}
