import { connectToDatabase } from "../db/index.js";
export const getLocation = async (req, res) => {
    const { name } = req.query;
    const client = await connectToDatabase();
    const db = client.db("CCD");
    const collection = db.collection("countries");
    
    // Convert the name from the request query to lower case
    const lowerCaseName = name.toLowerCase();
    
    // Find the first 5 documents where the lower case name field matches the lower case name from the request query
    let results = await collection.find({ name: { $regex : new RegExp(lowerCaseName, "i") } }).limit(5).toArray();
    
    res.json(results);
  };
  
  