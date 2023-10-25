import express from "express";
import { getArticleDetail, getArticles, getSingleArticle } from "../controllers/ArticlesController.js";

const router = express.Router();

router.get("/get", getArticles);
router.get("/find", getSingleArticle);
router.get("/find_detail", getArticleDetail);

export default router;