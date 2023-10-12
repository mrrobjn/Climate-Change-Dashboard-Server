import express from 'express'
import { getHistorical,crawHistorical} from '../controllers/HistoricalController.js'

const router = express.Router()

router.get('/get', getHistorical)
router.get('/crawHistorical', crawHistorical)
export default router