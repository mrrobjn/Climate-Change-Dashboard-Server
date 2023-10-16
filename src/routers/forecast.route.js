import express from 'express'
import { getForecast,  crawForecast } from '../controllers/ForeCastController.js'

const router = express.Router()

router.get('/', getForecast)
router.get('/craw',crawForecast)


export default router