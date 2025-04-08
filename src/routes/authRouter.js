/**
 * @file Defines the issue router.
 * @module routes/issueRouter
 * @author Frida Pedersén
 * @version 3.0.0
 */

import express from 'express'
import { AuthController } from '../controllers/authController.js'

export const router = express.Router()

const controller = new AuthController()

router.get('/', controller.login)
router.get('/callback', (req, res) => {
    controller.callback(req, res)
})
router.get('/logout', (req, res) => {
    console.log('req', req.session)
    controller.logout(req, res)
})