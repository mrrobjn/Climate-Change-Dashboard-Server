import express from "express";
import {
  getAirQuality,
  crawAirQuality,
} from "../controllers/AirQualityController.js";

const router = express.Router();

router.get('/get', getAirQuality);
router.get('/craw', crawAirQuality);

export default router;
