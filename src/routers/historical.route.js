import express from 'express'
import { getHistorical} from '../controllers/HistoricalController.js'

const router = express.Router()

router.get('/get', getHistorical)

export default router