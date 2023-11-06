import express from "express";
import { getArticleDetail, getArticles, getSingleArticle,insert,Delete} from "../controllers/ArticlesController.js";

const router = express.Router();

router.get("/get", getArticles);
router.get("/find", getSingleArticle);
router.get("/find_detail", getArticleDetail);
router.post("/insert",insert);
router.delete("delete",Delete);
export default router;