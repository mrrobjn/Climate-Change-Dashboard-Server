import express from 'express'
import { getForecast,crawForecast } from '../controllers/ForeCastController.js'

const router = express.Router()

router.get('/getForecast', getForecast)
router.get('/crawForecast',crawForecast)


export default router