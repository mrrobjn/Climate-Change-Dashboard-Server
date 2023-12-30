import express from "express";
import {
  getArticleDetail,
  getArticles,
  getSingleArticle,
  insert,
  deleteArticle,
  deleteArticleContent,
  increaseViewCount,
  updateContent,
  updateArticle,
} from "../app/controllers/ArticlesController.js";
import checkRole from "../app/middlewares/checkRole.js";

const router = express.Router();

router.get("/get", getArticles);
router.get("/find", getSingleArticle);
router.get("/find_detail", getArticleDetail);
router.post("/insert", checkRole, insert);
router.delete("/delete", checkRole, deleteArticle);
router.delete("/delete_content", checkRole, deleteArticleContent);
router.post("/update_content", checkRole, updateContent);
router.post("/update_article", checkRole, updateArticle);
router.post("/increase_view", increaseViewCount);

export default router;
