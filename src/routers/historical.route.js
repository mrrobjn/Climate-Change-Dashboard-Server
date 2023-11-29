import express from 'express'
import { getHistorical,crawHistorical,downloadHistorical} from '../app/controllers/HistoricalController.js'

const router = express.Router()

router.get('/get', getHistorical)
router.get('/download',downloadHistorical)
router.get('/craw', crawHistorical)
export default router