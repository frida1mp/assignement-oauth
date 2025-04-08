/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-description */
import axios from 'axios'

export const gitlabRepository = {
  /**
   * Exchanges authorization code for an access token.
   *
   * @param {string} code - Authorization code from GitLab.
   * @returns {Promise<object>} - The raw response from GitLab API.
   */
  async fetchAccessToken(code) {
    const tokenUrl = `${process.env.GITLAB_BASE_URL}/oauth/token`

    return axios.post(tokenUrl, {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.REDIRECT_URI
    })
  },

  /**
 *
 * @param {string} accessToken
 */
  async fetchUserProfile(accessToken) {
    return await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/user`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  },

  /**
   *
   * @param {string} accessToken -
   */
  async fetchUserGroups(accessToken) {
    return axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/groups`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  },

  async logout(accessToken) {
    const clientId = process.env.GITLAB_CLIENT_ID;
    const clientSecret = process.env.GITLAB_CLIENT_SECRET;
    return axios.post('https://gitlab.com/oauth/revoke', null, {
      params: {
        token: accessToken,
        client_id: clientId,
        client_secret: clientSecret
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
}
