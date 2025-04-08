import functions from 'firebase-functions'
import dotenv from 'dotenv'

// Load .env for local development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

/**
 * Fetches the configuration value from either local .env or Firebase functions config.
 *
 * @param {string} key - The environment variable key in uppercase (like 'DB_CONNECTION_STRING').
 * @returns {string} The corresponding environment variable value.
 */
export const getConfig = (key) => {
  // First, check in local `.env` for development
  if (process.env[key]) {
    return process.env[key]
  }

  // Map the keys manually for Firebase config
  const keyMap = {
    NODE_ENV: functions.config().node?.env,
    DB_CONNECTION_STRING: functions.config().db?.connection_string,
    SESSION_SECRET: functions.config().session?.secret,
    SESSION_NAME: functions.config().session?.name,
    SERVER_PORT: functions.config().server?.port,
    SERVER_BASE_URL: functions.config().server?.base_url,
    GITLAB_TOKEN: functions.config().gitlab?.token,
    GITLAB_PROJECT_ID: functions.config().gitlab?.project_id,
    GITLAB_CLIENT_ID: functions.config().gitlab?.client_id,
    GITLAB_CLIENT_SECRET: functions.config().gitlab?.client_secret,
    GITLAB_REDIRECT_URI: functions.config().gitlab?.redirect_uri,
    GITLAB_BASE_URL: functions.config().gitlab?.base_url

  }

  const value = keyMap[key]

  if (value) {
    return value
  }

  throw new Error(`Environment variable "${key}" is not defined.`)
}
