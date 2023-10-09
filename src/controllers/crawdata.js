import chalk from "chalk";
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
    const totalCountries = countries.length;
    let completedCountries = 0;

    for (let country of countries) {
      const existingDoc = await db2.findOne({
        "location.coordinates": [country.longitude, country.latitude],
      });
      if (!existingDoc) {
        try {
          const data = await fetchAPI(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${country.latitude}&longitude=${country.longitude}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&start_date=2022-07-29&end_date=2023-10-07`
          );
          if (data.latitude) {
            await db2.insertOne({
              ...parse(stringify(data)),
              location: {
                type: "Point",
                coordinates: [country.longitude, country.latitude],
              },
            });
            console.log(chalk.green(`success at: ${country.name}`));
          } else {
            console.log(
              chalk.red(
                "error while fetching for " +
                  country.name +
                  ": " +
                  JSON.stringify(data, null, 2)
              )
            );
          }
        } catch (error) {
          console.log(
            `An error occurred while fetching data for ${country.name}: ${error}`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 20000));
      } else {
        console.log(chalk.green(`Doc exist at: ${country.name}`));
      }
      completedCountries++;
      console.log(
        chalk.blue(
          `${((completedCountries / totalCountries) * 100).toFixed(2)}%`
        )
      );
    }
  } catch (error) {
    console.log(`An error occurred: ${error}`);
  }
};

export const crawCountries = async (req, res) => {
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
