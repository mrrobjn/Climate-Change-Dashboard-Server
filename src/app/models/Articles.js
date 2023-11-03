import mongoose from 'mongoose';
const Schema = mongoose.Schema
      const ArticleSchema = new Schema({
        articles_id:{type: String},
        title: { type: String },
        img_url: { type: String },
        date_created: { type: Date, default: Date.now },
        view: { type: Number,default:0 },
        // author_id: { type: String },
      },{
        timestamps: true,
      });
      const Article = mongoose.model('Article', ArticleSchema, 'articles');

export default Article;