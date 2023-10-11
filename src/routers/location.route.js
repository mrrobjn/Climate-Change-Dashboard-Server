import express from 'express'
import { crawLocation, getLocation} from '../controllers/LocationController.js'

const router = express.Router()

router.get('/get', getLocation)
router.get('/craw', crawLocation)

export default router