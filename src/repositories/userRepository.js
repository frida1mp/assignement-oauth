import axios from 'axios'

export const userRepository = {
  /**
   * Fetches the user's profile from GitLab.
   *
   * @param {string} accessToken - The access token for authorization.
   * @returns {Promise<object>} - The GitLab user profile.
   */
  async fetchUserProfile (accessToken) {
    try {
      const response = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error.message)
      throw new Error('Failed to fetch user profile from GitLab.')
    }
  },

  /**
   *
   * @param accessToken
   * @param userId
   */
  async fetchUserActivities (accessToken, userId) {
    try {
      const response = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/users/${userId}/events`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error.message)
      throw new Error('Failed to fetch user profile from GitLab.')
    }
  },

  /**
   *
   * @param accessToken
   */
  async fetchGroups (accessToken) {
    try {
      const response = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/groups`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const groupIds = response.data.map(group => group.id)
      return groupIds
    } catch (error) {
      console.error('Error fetching group IDs:', error.response ? error.response.data : error.message)
      throw new Error('Failed to fetch group IDs from GitLab.')
    }
  },
  /**
   *
   * @param accessToken
   * @param groupIds
   */
  async fetchUserProjects (accessToken, groupIds) {
    try {
      const limitedGroupIds = groupIds.slice(0, 3)
      const projects = await Promise.all(
        limitedGroupIds.map(async (groupId) => {
          const groupInfo = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/groups/${groupId}?per_page=5`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })

          const projectsResponse = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/groups/${groupId}/projects`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })

          const projectsWithCommits = await Promise.all(
            projectsResponse.data.map(async (project) => {
              try {
                const commitsResponse = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/projects/${project.id}/repository/commits?per_page=1`, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                })

                const lastCommit = commitsResponse.data[0] || null

                // Fetch author's avatar if commit exists
                let avatarUrl = null
                if (lastCommit && lastCommit.author_name) {
                  try {
                    const userResponse = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/users?search=${lastCommit.author_name}`, {
                      headers: {
                        Authorization: `Bearer ${accessToken}`
                      }
                    })
                    avatarUrl = userResponse.data[0]?.avatar_url || null
                  } catch (userError) {
                    console.error('Error fetching user avatar:', userError.message)
                  }
                }

                return {
                  ...project,
                  last_commit: lastCommit
                    ? {
                        ...lastCommit,
                        avatar_url: avatarUrl
                      }
                    : null
                }
              } catch (err) {
                return {
                  ...project,
                  last_commit: null
                }
              }
            })
          )

          return {
            groupId,
            groupName: groupInfo.data.name,
            groupPath: groupInfo.data.full_path,
            projects: projectsWithCommits
          }
        })
      )

      return projects
    } catch (error) {
      console.error('Error fetching user projects:', error.response ? error.response.data : error.message)
      throw new Error('Failed to fetch user projects from GitLab.')
    }
  }
}
