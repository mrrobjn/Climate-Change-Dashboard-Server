import express from 'express'
import { getHistoricalWeather} from '../controllers/historicalweather.js'

const router = express.Router()

router.get('/', getHistoricalWeather)

export default router