import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ArticleSchema = new Schema(
  {
    title: { type: String },
    desc: { type: String },
    img_url: { type: String },
    view: { type: Number, default: 0 },
    //  author_id: { type: String },
  },
  {
    timestamps: true,
  }
);
const Article = mongoose.model("Article", ArticleSchema, "articles");

export default Article;
