import mongoose from 'mongoose';
const Schema = mongoose.Schema
      const ArticleSchema = new Schema({
       // articles_id:{type: String},
       type: { type: String, default: 'article' }, 
        title: { type: String },
        img_url: { type: String },
        date_created: { type: Date, default: Date.now },
        view: { type: Number },
      //  author_id: { type: String },
      },{
        timestamps: true,
      });
      const Article = mongoose.model('Article', ArticleSchema, 'articles');

export default Article;