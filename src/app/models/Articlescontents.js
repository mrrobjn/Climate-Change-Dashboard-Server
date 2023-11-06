import mongoose from "mongoose";
const ArticleContentSchema = new mongoose.Schema(
  {
    articles_id: { type: String },
    type: { type: String, default: 'article' }, 
    base64: { type: String },
    question: { type: String },
    rationale: { type: String },
    visualization: { type: String },
    description: { type: String },
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
