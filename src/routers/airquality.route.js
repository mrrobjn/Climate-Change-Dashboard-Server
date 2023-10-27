import express from "express";
import {
  getAirQuality,
  crawAirQuality,
  downloadAirQuality,
} from "../controllers/AirQualityController.js";

const router = express.Router();

router.get('/get', getAirQuality);
router.get('/craw', crawAirQuality);
router.get('/download', downloadAirQuality);

export default router;
