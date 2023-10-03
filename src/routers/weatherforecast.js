import express from 'express'
import { getWeatherForecast} from '../controllers/weatherforecast.js'

const router = express.Router()

router.get('/', getWeatherForecast)

export default router