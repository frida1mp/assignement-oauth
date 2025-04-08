/**
 * @file Defines the user router.
 * @module routes/userRouter
 * @author Frida Pedersén
 * @version 3.0.0
 */

import express from 'express'
import { UserController } from '../controllers/userController.js'

export const router = express.Router()

const controller = new UserController()

router.get('/', (req, res) => controller.loadUser(req, res))

router.get('/profile', (req, res) => controller.profile(req, res))

router.get('/activities', (req, res) => controller.activities(req, res))

router.get('/projects', (req, res) => controller.projects(req, res))

router.get('/dashboard', (req, res) => {
  controller.dashboard(req, res)
})
