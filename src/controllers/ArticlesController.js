import { ObjectId } from "mongodb";
import { connectToDatabase } from "../db/index.js";

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

  const result = await detailCollection.find({ articles_id: new ObjectId(id) }).toArray();
  res.json(result);
};
