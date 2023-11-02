import express from "express";
import { getArticleDetail, getArticles, getSingleArticle,insert,deleteAticle } from "../controllers/ArticlesController.js";

const router = express.Router();

router.get("/get", getArticles);
router.get("/find", getSingleArticle);
router.get("/find_detail", getArticleDetail);
router.use("/insert",insert);
router.use("/delete",deleteAticle);
export default router;