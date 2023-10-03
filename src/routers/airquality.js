import express from 'express'
import { getAirquality} from '../controllers/airquality.js'

const router = express.Router()

router.get('/', getAirquality)

export default router