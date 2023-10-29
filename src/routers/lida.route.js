import express from "express";
import { uploadData, postSingleGoal } from "../controllers/LidaController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

router.post("/post", upload.single("file"), uploadData);
router.post("/post_goal", postSingleGoal);

export default router;
