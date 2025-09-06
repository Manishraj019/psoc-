import apiClient from './apiClient'

export const adminService = {
  // Level management
  async getLevels() {
    const response = await apiClient.get('/admin/levels')
    return response.data
  },

  async createLevel(levelData, images) {
    const formData = new FormData()
    formData.append('levelNumber', levelData.levelNumber)
    formData.append('isFinal', levelData.isFinal)
    formData.append('hint', levelData.hint)
    formData.append('description', levelData.description || '')
    
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images', image)
      })
    }

    const response = await apiClient.post('/admin/levels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async updateLevel(levelId, levelData, images) {
    const formData = new FormData()
    if (levelData.hint !== undefined) formData.append('hint', levelData.hint)
    if (levelData.description !== undefined) formData.append('description', levelData.description)
    if (levelData.isFinal !== undefined) formData.append('isFinal', levelData.isFinal)
    
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images', image)
      })
    }

    const response = await apiClient.put(`/admin/levels/${levelId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteLevel(levelId) {
    const response = await apiClient.delete(`/admin/levels/${levelId}`)
    return response.data
  },

  // Submission management
  async getPendingSubmissions() {
    const response = await apiClient.get('/admin/submissions')
    return response.data
  },

  async approveSubmission(submissionId, reason) {
    const response = await apiClient.post(`/admin/submissions/${submissionId}/approve`, {
      reason: reason || 'Approved by admin'
    })
    return response.data
  },

  async rejectSubmission(submissionId, reason) {
    const response = await apiClient.post(`/admin/submissions/${submissionId}/reject`, {
      reason: reason || 'Rejected by admin'
    })
    return response.data
  },

  // Leaderboard
  async getLeaderboard() {
    const response = await apiClient.get('/admin/leaderboard')
    return response.data
  },

  // Game control
  async startGame() {
    const response = await apiClient.post('/admin/game/start')
    return response.data
  },

  async pauseGame() {
    const response = await apiClient.post('/admin/game/pause')
    return response.data
  },

  async resetGame() {
    const response = await apiClient.post('/admin/game/reset')
    return response.data
  },

  async getGameState() {
    const response = await apiClient.get('/admin/game/state')
    return response.data
  },
}
