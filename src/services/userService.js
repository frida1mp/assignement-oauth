import { userRepository } from '../repositories/userRepository.js'

export const userService = {
    groupIds: [],
  /**
   * 
   * Retrieves the user's profile and processes it if needed.
   *
   * @param {string} accessToken - The access token to fetch user data.
   * @returns {Promise<object>} - The processed user profile data.
   */
  async getUserProfile (accessToken) {
    try {
      const userProfile = await userRepository.fetchUserProfile(accessToken)

      console.log('user profile', userProfile)

      return {
        id: userProfile.id,
        username: userProfile.username,
        name: userProfile.name,
        email: userProfile.email,
        avatarUrl: userProfile.avatar_url,
        lastActivity: userProfile.last_activity_on
      }
    } catch (error) {
      console.error('UserService Error:', error.message)
      throw new Error('Unable to retrieve user profile.')
    }
  },

  /**
   *
   * @param accessToken
   */
  async getUserActivities (accessToken, userId) {
    try {
      const activities = await userRepository.fetchUserActivities(accessToken, userId)
      return {
        activities
      }
    } catch (error) {
      console.error('UserService Error:', error.message)
      throw new Error('Unable to retrieve user profile.')
    }
  },

  /**
   *
   */
  async setGroupIds (accessToken) {
    if (ids && req.session.groups && Array.isArray(req.session.groups)) {
      this.groupIds = req.session.groups.map(group => group.id)
      return this.getGroupIds
    }
    this.getGroupIds = []
    return []
  },

  /**
   *
   * @param accessToken
   */
  async getUserProjects (accessToken) {
    try {
      const groupIds = await userRepository.fetchGroups(accessToken)
      const groupsWithProjects = await userRepository.fetchUserProjects(accessToken, groupIds)
      return {
        groupsWithProjects
      }
    } catch (error) {
      console.error('UserService Error:', error.message)
      throw new Error('Unable to retrieve user projects.')
    }
  }

}
