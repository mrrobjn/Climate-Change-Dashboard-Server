import express from 'express'
import { getForecast } from '../controllers/ForeCastController.js'

const router = express.Router()

router.get('/get', getForecast)

export default router