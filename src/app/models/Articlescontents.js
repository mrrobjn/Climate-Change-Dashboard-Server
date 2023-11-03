import mongoose from 'mongoose';
      const ArticleContentSchema = new mongoose.Schema({
        articles_id: { type: String },
        type:  { type: String },
        order:  { type: Number },
        data:  { type: String },
      },{
        timestamps: true,
      });
     const ArticleContent = mongoose.model('ArticleContent', ArticleContentSchema, 'articles_contents');
export default ArticleContent ;