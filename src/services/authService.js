/* eslint-disable jsdoc/require-returns */
import axios from 'axios'
import { gitlabRepository } from '../repositories/authRepository.js'
import { response } from 'express'

export const authService = {
  // eslint-disable-next-line jsdoc/require-description, jsdoc/require-returns
  /**
   *
   * @param {string }code -
   */
  async getAccessToken (code) {
    try {
      const response = await gitlabRepository.fetchAccessToken(code)

      if (!response.data || !response.data.access_token) {
        throw new Error('Access token not found in the response')
      }

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      }
    } catch (error) {
      console.error('Error fetching access token:', error.message)
      throw new Error('Failed to retrieve access token from GitLab.')
    }
  },

  // eslint-disable-next-line jsdoc/require-description, jsdoc/require-returns
  /**
   *
   * @param {string} accessToken -
   */
  async getUserProfile (accessToken) {
    try {
      const response = await gitlabRepository.fetchUserProfile(accessToken)

      if (!response) {
        throw new Error('User profile not found in the response')
      }

      return response
    } catch (error) {
      console.error(error)
    }
  },

  // eslint-disable-next-line jsdoc/require-description, jsdoc/require-returns
  /**
   *
   * @param {string} accessToken -
   */
  async getUserActivities (accessToken) {
    const response = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/events?per_page=101`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    return response.data
  },

  // eslint-disable-next-line jsdoc/require-description
  /**
   *
   * @param {string} accessToken -
   */
  async getUserGroups (accessToken) {
    const response = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/groups`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    // Fetch first three projects of each of the first five groups
    const groups = response.data.slice(0, 5)
    for (const group of groups) {
      const projects = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/groups/${group.id}/projects?per_page=3`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      group.projects = projects.data

      // Fetch latest commit for each project
      for (const project of group.projects) {
        const commits = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/projects/${project.id}/repository/commits`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        project.latestCommit = commits.data[0]
      }
    }

    return groups
  },

  /**
   *
   * @param req
   * @param res
   */
  async logoutUser (req, res) {
    try {
      if (!req.session.accessToken) {
        return res.status(400).json({ message: 'No active session.' })
      }
      const apiResponse = await gitlabRepository.logout(req.session.accessToken)
      console.log('GitLab API Response:', apiResponse.status)

      if (apiResponse.status !== 200) {
        console.error('Failed to logout from GitLab:', apiResponse.statusText)
        return res.status(500).json({ message: 'Failed to logout from GitLab.' })
      }
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })
      return { status: 200, message: 'Successfully logged out.' }
    } catch (error) {
      console.error('Logout error:', error.message)

      if (!res.headersSent) {
        return res.status(500).json({ message: 'Logout failed.' })
      }
    }
  }
}
