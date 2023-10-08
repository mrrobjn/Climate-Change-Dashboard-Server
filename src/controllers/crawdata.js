import { fetchAPI } from "../api/fetchApi.js";
import { connectToDatabase } from "../db/index.js";
import { parse, stringify } from "flatted";
export const crawAirQuality = async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db("CCD");

    const db1 = db.collection("countries");
    const db2 = db.collection("air-quality");

    const countries = await db1.find({}).toArray();
    let count = 0;

    for (let country of countries) {
      count++;
      console.log(`${count}/ ${country.country}`);
      const encodedCountry = encodeURIComponent(country.name);
      try {
        const data = await fetchAPI(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${country.latitude}&longitude=${country.longitude}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&start_date=2022-07-29&end_date=2023-10-07`
        );
        if (data) {
          await db2.insertOne({
            ...parse(stringify(data)),
            location: {
              type: "Point",
              coordinates: [data.longitude, data.latitude],
            },
          });
        }
        if (data.status === 429) {
          console.error("Rate limit hit. Stopping the process.");
          res.status(429).send("Rate limit hit. Stopping the process.");
          return; 
        }
      } catch (error) {
        console.error(
          `An error occurred while fetching data for ${country.country}: ${error}`
        );
        if (error.response && error.response.status === 429) {
          console.error("Rate limit hit. Stopping the process.");
          res.status(429).send("Rate limit hit. Stopping the process.");
          return; 
        }
      }
      // Add a delay between requests to avoid hitting the rate limit
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    res.status(200).send("Data fetched successfully");
  } catch (error) {
    console.error(`An error occurred: ${error}`);
    res.status(500).send("An error occurred while fetching data");
  }
};

// export const crawCountries = async (req, res) => {
//     try {
//       const client = await connectToDatabase();
//       const db = client.db("CCD");

//       const countriesCollection = db.collection("countries");
//       const countriessCollection = db.collection("countriess");

//       const distinctCountries = await countriessCollection.distinct("country");

//       await Promise.all(
//         distinctCountries.map(async (country) => {
//           console.log(`Fetching data for ${country}`);
//           const encodedCountry = encodeURIComponent(country);
//           const data = await fetchAPI(
//             `https://geocoding-api.open-meteo.com/v1/search?name=${encodedCountry}&count=1&language=en&format=json`
//           );
//           if (data.results) {
//             await countriesCollection.insertOne(data.results[0]);
//             return data.results[0];
//           } else {
//             console.error(`No results found for ${country}`);
//             return null;
//           }
//         })
//       );
//     } catch (error) {
//       console.error(`An error occurred: ${error}`);
//     }
//   };
