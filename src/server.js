/**
 * @file Defines the main application..
 * @module app
 * @author Mats Loock
 * @version 3.4.0
 */

import httpContext from 'express-http-context' // Must be first!
import express from 'express'
import dotenv from 'dotenv'
import expressLayouts from 'express-ejs-layouts'
import session from 'express-session'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectToDatabase } from './config/mongoose.js'
import { morganLogger } from './config/morgan.js'
import { sessionOptions } from './config/sessionOptions.js'
import { logger } from './config/winston.js'
import { router } from './routes/router.js'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import functions from 'firebase-functions'
import { getConfig } from './config/config.js'

export const app = express()
try {
  // Creates an Express application.

  // Create http server and pass it to socket.io
  const httpServer = createServer(app)
  const io = new Server(httpServer)

  // Get the directory name of this module's path.
  const directoryFullName = dirname(fileURLToPath(import.meta.url))

  console.log('base', getConfig('SERVER:BASE_URL'))
  // Set the base URL to use for all relative URLs in a document.
  const baseURL = getConfig('SERVER_BASE_URL') || '/'

  // View engine setup.
  app.set('view engine', 'ejs')
  app.set('views', join(directoryFullName, 'views'))
  app.set('layout', join(directoryFullName, 'views', 'layouts', 'default'))
  app.set('layout extractScripts', true)
  app.set('layout extractStyles', true)
  app.use(expressLayouts)

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: false }))

  // --------------------------------------------------------------------------
  //
  // Webhook: Parse incoming requests with JSON payloads (application/json).
  // Populates the request object with a body object (req.body).
  //
  app.use(express.json())
  // --------------------------------------------------------------------------

  // Serve static files.
  app.use(express.static(join(directoryFullName, '..', 'public')))

  // Setup and use session middleware (https://github.com/expressjs/session)
  if (getConfig('NODE_ENV') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
  }

  app.use((req, res, next) => {
    res.locals.session = req.session // Now session is available in all views
    next()
  })

  app.use(session(sessionOptions))

  // Add the request-scoped context.
  // NOTE! Must be placed before any middle that needs access to the context!
  //       See https://www.npmjs.com/package/express-http-context.
  app.use(httpContext.middleware)

  // Use a morgan logger.
  app.use(morganLogger)

  // Middleware to be executed before the routes.
  app.use((req, res, next) => {
    // Add a request UUID to each request and store information about
    // each request in the request-scoped context.

    // Flash messages - survives only a round trip.
    if (req.session.flash) {
      res.locals.flash = req.session.flash
      delete req.session.flash
    }

    // Pass the base URL to the views.
    res.locals.baseURL = baseURL

    next()
  })

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use((err, req, res, next) => {
    logger.error(err.message, { error: err })

    // 401 Unauthorized.
    if (err.status === 401) {
      res
        .status(401)
        .sendFile(join(directoryFullName, 'views', 'errors', '401.html'))
      return
    }

    // 404 Not Found.
    if (err.status === 404) {
      res
        .status(404)
        .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
      return
    }

    // 500 Internal Server Error (in production, all other errors send this response).
    if (getConfig('NODE_ENV') !== 'development') {
      res
        .status(500)
        .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
      return
    }

    // ---------------------------------------------------
    // ⚠️ WARNING: Development Environment Only!
    //             Detailed error information is provided.
    // ---------------------------------------------------

    // Render the error page.
    res
      .status(err.status || 500)
      .render('errors/error', { error: err })
  })

  // Starts the HTTP server listening for connections.
  httpServer.listen(getConfig('SERVER_PORT'), () => {
    logger.info(`Server running at http://localhost:${getConfig('SERVER_PORT')}`)
    logger.info('Press Ctrl-C to terminate...')
  })

  httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (socket) => {
      wss.emit('connection', socket, request)
    })
  })

} catch (err) {
  logger.error(err.message, { error: err })
  process.exitCode = 1
}