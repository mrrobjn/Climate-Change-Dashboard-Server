import express from 'express'

import { getForecast,  crawForecast } from '../controllers/ForeCastController.js'

const router = express.Router()

router.get('/get', getForecast)
router.get('/craw',crawForecast)



export default router