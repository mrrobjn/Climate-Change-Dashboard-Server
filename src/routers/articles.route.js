import express from "express";
import { getArticleDetail, getArticles, getSingleArticle,insert, deleteArticle,deleteArticleContent, increaseViewCount,updateContent,updateArticle} from "../app/controllers/ArticlesController.js";

const router = express.Router();

router.get("/get", getArticles);
router.get("/find", getSingleArticle);
router.get("/find_detail", getArticleDetail);
router.post("/insert",insert);
router.delete("/delete",deleteArticle);
router.delete("/delete_content",deleteArticleContent)
router.post("/update_content",updateContent);
router.post("/update_article",updateArticle);
router.post("/increase_view",increaseViewCount);

export default router;