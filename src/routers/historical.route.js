import express from 'express'
import { getHistorical,crawHistorical} from '../app/controllers/HistoricalController.js'

const router = express.Router()

router.get('/get', getHistorical)
router.get('/craw', crawHistorical)
export default router