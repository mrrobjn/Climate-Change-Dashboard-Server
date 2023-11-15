import express from "express";
import { uploadData, postSingleGoal,modifyGoal } from "../app/controllers/LidaController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

router.post("/post", upload.single("file"), uploadData);
router.post("/post_goal", postSingleGoal);
router.post("/modify_goal", modifyGoal);

export default router;
