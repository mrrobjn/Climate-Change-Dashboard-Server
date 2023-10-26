import express from "express";
import { LIDACSV } from "../controllers/LidaController.js";

const router = express.Router();

router.get("/get", LIDACSV);

export default router;