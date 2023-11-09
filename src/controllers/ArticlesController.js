import { ObjectId } from "mongodb";
import { connectToDatabase } from "../db/index.js";

import mongoose from "mongoose";
import Article from "../app/models/Articles.js";
import ArticleContent from "../app/models/Articlescontents.js";

export const getArticles = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const searchQuery = req.query.search || '';
  const sortField = req.query.field || 'createdAt'; // default sort field is 'createdAt'
  const sortOrder = req.query.order === 'desc' ? -1 : 1; // default sort order is ascending

  try {
    const articles = await Article.find({ title: { $regex: searchQuery, $options: 'i' } })
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalArticles = await Article.countDocuments({ title: { $regex: searchQuery, $options: 'i' } });
    const totalPages = Math.ceil(totalArticles / limit);

    res.status(200).json({ articles, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ERR: error });
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

  const detailCollection = db.collection("articles_contents");

  const result = await detailCollection
    .find({
      article_id: new ObjectId(id),
    })
    .toArray();
  res.json(result);
};
export async function insert(req, res) {
  const ArticleID = new mongoose.Types.ObjectId();
  const article = {
    articles_id: ArticleID,
    ...req.body,
  };
  const { contents } = req.body;
  const newArticle = new Article(article);
  newArticle
    .save()
    .then((savedArticle) => {
      contents.map((content, index) => {
        content.index = index;
        content.article_id = savedArticle._id; // Set the foreign key here
        const newArticleContent = new ArticleContent(content);
        newArticleContent
          .save()
          .then(() => {
            res.status(200);
          })
          .catch((error) => {
            console.error(error);
            res.status(400).json({ error });
          });
        return;
      });
      res.status(200).json({
        message: "Create Article successfully",
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ error });
    });
}

export async function deleteArticle(req, res) {
  const articleId = req.body._id;
 try {
   await ArticleContent.deleteMany({article_id: articleId });
   const result = await Article.deleteOne({ _id: articleId });
   if (result.deletedCount > 0) {
     res.json({ message: 'deletion Article completed.' });
   } else {
     res.json({message: error });
   }
 } catch (error) {
   console.error(error);
   res.json({message: error });
 }
}
