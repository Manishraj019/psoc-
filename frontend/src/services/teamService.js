import apiClient from './apiClient'

export const teamService = {
  // Get team progress
  async getProgress() {
    const response = await apiClient.get('/team/progress')
    return response.data
  },

  // Submit image for current level
  async submitImage(imageFile) {
    const formData = new FormData()
    formData.append('file', imageFile)
    
    const response = await apiClient.post('/team/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get submission history
  async getSubmissionHistory() {
    const response = await apiClient.get('/team/submissions')
    return response.data
  },

  // Get current submission status
  async getCurrentSubmissionStatus() {
    const response = await apiClient.get('/team/submission-status')
    return response.data
  },
}
