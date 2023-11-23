import express from "express";
import { getArticleDetail, getArticles, getSingleArticle,insert, deleteArticle,deleteArticleContent, increaseViewCount,updateContent,updateArticle} from "../app/controllers/ArticlesController.js";

const router = express.Router();

router.get("/get", getArticles);
router.get("/find", getSingleArticle);
router.get("/find_detail", getArticleDetail);
router.post("/insert",insert);
router.delete("/delete",deleteArticle);
router.delete("/deletecontent",deleteArticleContent)
router.put("/updatecontent",updateContent);
router.put("/updatearticle",updateArticle);
router.post("/increase_view",increaseViewCount);
export default router;