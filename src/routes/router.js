/**
 * @file Defines the main router.
 * @module routes/router
 * @author Mats Loock
 * @version 3.1.0
 */

import express from 'express'
import http from 'node:http'
import { router as homeRouter } from './homeRouter.js'
import { router as authRouter } from './authRouter.js'
import { router as userRouter } from './userRouter.js'

export const router = express.Router()

router.use('/', homeRouter)
router.use('/auth', authRouter)
router.use('/user', userRouter)

// --------------------------------------------------------------------------

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => {
  const statusCode = 404
  const error = new Error(http.STATUS_CODES[statusCode])
  error.status = statusCode
  next(error)
})
