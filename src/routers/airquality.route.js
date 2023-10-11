import express from "express";
import {
  getAirquality,
  crawAirQuality,
} from "../controllers/AirQualityController.js";

const router = express.Router();

router.get("/get", getAirquality);
router.get("/craw", crawAirQuality);

export default router;
