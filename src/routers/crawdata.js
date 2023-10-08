import express from 'express'
import { crawAirQuality} from '../controllers/crawdata.js'

const router = express.Router()

router.get('/', crawAirQuality)

export default router