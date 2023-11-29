import express from 'express'

import { getForecast,  crawForecast,downloadForecast } from '../app/controllers/ForeCastController.js'

const router = express.Router()

router.get('/get', getForecast)
router.get('/download',downloadForecast)
router.get('/craw',crawForecast)



export default router