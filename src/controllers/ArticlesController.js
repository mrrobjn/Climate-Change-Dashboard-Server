import { ObjectId } from "mongodb";
import { connectToDatabase } from "../db/index.js";

import mongoose from 'mongoose';
import Article from "../app/models/Articles.js";
import ArticleContent from "../app/models/Articlescontents.js";

export const getArticles = async (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const perPage = 4;

  try {
    const articles = await Article.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'ERR':error });
  }
};
export const getSingleArticle = async (req, res) => {
  const { id } = req.query;
  const client = await connectToDatabase();
  const db = client.db("CCD");

  const articlesCollection = db.collection("articles");

  const article = await articlesCollection.findOne({ _id: new ObjectId(id) });
  res.json(article);
};
export const getArticleDetail = async (req, res) => {
  const { id } = req.query;
  const client = await connectToDatabase();
  const db = client.db("CCD");

  const detailCollection = db.collection("articles_details");

  const result = await detailCollection.find({ articles_id: new ObjectId(id) }).toArray();
  res.json(result);
};


 export async function insert(req,res) {
const ArticleID = new mongoose.Types.ObjectId();
const dataToInsert = {
  articles_id: ArticleID,
  ...req.body,
};
const newArticle = new Article(dataToInsert);
newArticle.save()
  .then(() => {
    const newArticleContent = new ArticleContent(dataToInsert);
    newArticleContent.save()
      .then(() => {
        res.status(200).json({ message: "Create Article and ArticleContent successfully" });
      })
      .catch((error) => {
        console.error( error);
        res.status(400).json({ error });
      });
  })
  .catch((error) => {
    console.error( error);
    res.status(400).json({ error});
  });

}
export async function Delete(req, res) {
  const { id, type } = req.body;
  try {
    if (type === 'articles') {

      const articleDeleteResult = await Article.deleteOne({ _id: id });
      const articleContentsDeleteResult = await ArticleContent.deleteMany({ articles_id: id });
      if (articleDeleteResult.deletedCount > 0) {
        res.json({ message: 'Deletion of articles completed.' });
      } else {
        res.json({ message: 'No articles found for deletion.' });
      }
    } else if (type === 'articles_content') {
      const articleContentDeleteResult = await ArticleContent.deleteOne({ articles_id: id });
      if (articleContentDeleteResult.deletedCount > 0) {
        res.json({ message: 'Deletion of articles_content completed.' });
      } else {
        res.json({ message: 'No articles_content found for deletion.' });
      }
    } else {
      res.json({ message: 'Invalid type parameter.' });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: error });
  }
}
