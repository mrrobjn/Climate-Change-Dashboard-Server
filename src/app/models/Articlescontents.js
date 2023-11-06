import { ObjectId } from "mongodb";
import mongoose from "mongoose";
const ArticleContentSchema = new mongoose.Schema(
  {
    article_id: { type: ObjectId },
    chartURL: { type: String },
    question: { type: String },
    rationale: { type: String },
    visualization: { type: String },
    desc: { type: String },
    index: { type: Number },
  },
  {
    timestamps: true,
  }
);
const ArticleContent = mongoose.model(
  "ArticleContent",
  ArticleContentSchema,
  "articles_contents"
);
export default ArticleContent;
