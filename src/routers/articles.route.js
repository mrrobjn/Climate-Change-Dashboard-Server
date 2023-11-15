import express from "express";
import { getArticleDetail, getArticles, getSingleArticle,insert, deleteArticle, increaseViewCount} from "../app/controllers/ArticlesController.js";

const router = express.Router();

router.get("/get", getArticles);
router.get("/find", getSingleArticle);
router.get("/find_detail", getArticleDetail);
router.post("/insert",insert);
router.delete("/delete",deleteArticle);
router.post("/increase_view",increaseViewCount);
export default router;