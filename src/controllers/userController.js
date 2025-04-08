/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-description */
import { userService } from '../services/userService.js'
/**
 * @file Defines the AuthController class.
 * @module controllers/AuthController
 * @author Frida Pedersén
 * @version 3.3.0
 */
export class UserController {
  /**
   *
   * @param req
   * @param res
   */
  async loadUser (req, res) {
    try {
      const accessToken = req.session.accessToken

      if (!accessToken) {
        return res.redirect('/')
      }

      const user = await userService.getUserProfile(accessToken)
      req.session.user = user
      res.render('dashboard', { session: req.session })
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Failed to load profile.')
    }
  }

  /**
   *
   * @param req
   * @param res
   */
  async profile (req, res) {
    try {
      res.render('profile/index', { session: req.session })
    } catch (error) {
      console.error(error)
      res.status(500).send('Failed to load profile.')
    }
  }

  // eslint-disable-next-line jsdoc/require-description
  /**
   *
   * @param {object} req -
   * @param {object} res -
   * @param {object} next -
   */
  async dashboard (req, res, next) {
    try {
      res.render('dashboard/index', { session: req.session })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   *
   * @param req
   * @param res
   */
  async activities (req, res) {
    try {
      const accessToken = req.session.accessToken
      const userId = req.session.user.id
      const fetchedActivities = await userService.getUserActivities(accessToken, userId)

      const activities = fetchedActivities.activities
      res.render('activities/index', { session: req.session, activities })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   *
   * @param req
   * @param res
   */
  async projects (req, res) {
    try {
      const accessToken = req.session.accessToken

      const groupsWithProjects = await userService.getUserProjects(accessToken)

      console.log('user', groupsWithProjects.groupsWithProjects[1].projects)
    
      res.render('projects/index', { session: req.session, Projects: groupsWithProjects.groupsWithProjects })
    } catch (error) {
      console.error(error)
    }
  }

}
