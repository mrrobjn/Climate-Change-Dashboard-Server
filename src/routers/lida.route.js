import express from "express";
import { uploadData } from "../controllers/LidaController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

router.post("/post", upload.single("file"), uploadData);

export default router;
