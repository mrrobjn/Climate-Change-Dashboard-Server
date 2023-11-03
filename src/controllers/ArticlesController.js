import { ObjectId } from "mongodb";
import { connectToDatabase } from "../db/index.js";

import mongoose from "mongoose";
import Article from "../app/models/Articles.js";
import ArticleContent from "../app/models/Articlescontents.js";

export const getArticles = async (req, res) => {
  const client = await connectToDatabase();
  const db = client.db("CCD");

  const collection = db.collection("articles");

  const result = await collection.find({}).toArray();
  res.json(result);
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

  const result = await detailCollection
    .find({ articles_id: new ObjectId(id) })
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
    .then(() => {
      contents.map((content, index) => {
        content.order = index;
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

//delete
// export async function deleteArticle(req, res) {
//   try {
//     // Connect to the MongoDB database
//     await mongoose.connect('mongodb://127.0.0.1:27017/CCD', { useNewUrlParser: true, useUnifiedTopology: true });
//     const { article } = (req.body);
//     console.log(article);
//     const result = await ArticleContent.deleteOne({_id: article });
//     console.log(result.deletedCount);
//     if (result.deletedCount === 1) {
//       res.json({ message: 'Article content deleted successfully' });
//     } else {
//       res.status(404).json({ error: 'Article content not found or not deleted' });
//     }
//   } catch (error) {
//     console.error('Error deleting article content:', error);
//     res.status(500).json({ error: 'Delete failed' });
//   } finally {
//     // Close the database connection
//     mongoose.connection.close();
//   }
// }
