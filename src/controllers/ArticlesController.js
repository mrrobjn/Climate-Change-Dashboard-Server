import { ObjectId } from "mongodb";
import { connectToDatabase } from "../db/index.js";
import mongoose from 'mongoose';
import readline from 'readline';
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
 //insert
export async function insert() {
  try {
    mongoose.connect(`mongodb://127.0.0.1:27017/CCD`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Tạo bảng "articles" nếu chưa tồn tại
    await mongoose.connection.createCollection('articles');

    const ArticleSchema = new mongoose.Schema({
      title: String,
      img_url: String,
      date_created: { type: Date, default: Date.now },
      view: { type: Number, default: 0 },
      author_id: String,
    });

    const Article = mongoose.model('Article', ArticleSchema, 'articles');

    const title = await askQuestion(rl, 'Nhập tiêu đề bài viết: ');
    const img_url = await askQuestion(rl, 'Nhập URL hình ảnh: ');
    const author_id = await askQuestion(rl, 'Nhập tác giả: ');

    const newArticle = new Article({
      title,
      img_url,
      author_id,
    });

    const article = await newArticle.save();
    console.log('Bài viết đã được thêm vào cơ sở dữ liệu:', article);

    // Tạo bảng "articles_contents" nếu chưa tồn tại
    await mongoose.connection.createCollection('articles_contents');
    // console.log('Bảng "articles_contents" đã được tạo thành công.');

    const type = await askQuestion(rl, 'Nhập loại nội dung: ');
    const data = await askQuestion(rl, 'Nhập dữ liệu nội dung: ');

    const ArticleContentSchema = new mongoose.Schema({
      articles_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
      type: String,
      order: Number,
      data: String,
    });

    const ArticleContent = mongoose.model('ArticleContent', ArticleContentSchema, 'articles_contents');

    const newArticleContent = new ArticleContent({
      articles_id: article._id,
      type,
      order: 1,
      data,
    });

    const articleContent = await newArticleContent.save();
    console.log('Nội dung bài viết đã được thêm vào cơ sở dữ liệu:', articleContent);

    rl.close();
  } catch (error) {
    console.error('err:', error);
    rl.close();
  }
}
async function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

//delete
export async function deleteAticle() {


  mongoose.connect(`mongodb://127.0.0.1:27017/CCD`, { useNewUrlParser: true, useUnifiedTopology: true });
  const ArticleSchema = new mongoose.Schema({
  });
  const Article = mongoose.model('Article', ArticleSchema, 'articles');
  const ArticleContentSchema = new mongoose.Schema({
    articles_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    type: String,
    order: Number,
    data: String,
  });
  const ArticleContent = mongoose.model('ArticleContent', ArticleContentSchema, 'articles_contents');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Nhập ID của bài viết cần xóa: ', (articleId) => {
    // Gọi hàm xóa bài viết 
    deleteArticleAndContents(articleId);

    rl.close();
  });

  //xóa bài viết  dựa trên ID
  async function deleteArticleAndContents(articleId) {
    try {
      await Article.deleteOne({ _id: articleId });
      await ArticleContent.deleteMany({ articles_id: articleId });

      console.log('xóa thành công bai viet co ID:', (articleId));
    } catch (error) {
      console.error('err:', error);
    }
  }
}