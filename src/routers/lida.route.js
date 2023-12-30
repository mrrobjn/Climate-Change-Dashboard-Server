import express from "express";
import LidaController from "../app/controllers/LidaController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

router.post("/post", upload.single("file"), LidaController.uploadData);
router.post("/post_goal", LidaController.postSingleGoal);
router.post("/modify_goal", LidaController.modifyGoal);

export default router;
