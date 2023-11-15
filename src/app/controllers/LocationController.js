import chalk from "chalk";
import { connectToDatabase } from "../../db/index.js";
import { fetchAPI } from "../../api/fetchApi.js";
export const getLocation = async (req, res) => {
    const { name } = req.query;
    const client = await connectToDatabase();
    const db = client.db("CCD");
    const collection = db.collection("countries");
    
    // Convert the name from the request query to lower case
    const lowerCaseName = name.toLowerCase();
    
    // Find the first 5 documents where the lower case name field matches the lower case name from the request query
    let results = await collection.find({ name: { $regex: new RegExp(lowerCaseName, "i") } }).limit(5).toArray();
    
    res.json(results);
  };
  export const crawLocation = async (req, res) => {
    try {
      const client = await connectToDatabase();
      const db = client.db("CCD");
  
      const db1 = db.collection("fileset");
      const db2 = db.collection("countries");
  
      const distinctCountries = await db1.distinct("country");
  
      await Promise.all(
        distinctCountries.map(async (country) => {
          const encodedCountry = encodeURIComponent(country);
          const data = await fetchAPI(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodedCountry}&count=1&language=en&format=json`
            );
            if (data.results) {
              await db2.insertOne(data.results[0]);
              console.log(`Complete data for ${country}`);
            return data.results[0];
          } else {
            console.error(chalk.red(`No results found for ${country}`));
            return null;
          }
        })
      );
    } catch (error) {
      console.error(chalk.red(`An error occurred: ${error}`));
    }
  };
  
  