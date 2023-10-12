import chalk from "chalk";
import { fetchAPI } from "../api/fetchApi.js";
import { connectToDatabase } from "../db/index.js";
import { stringify,parse } from "flatted";
export const getHistorical = async (req, res) => {
  const { latitude, longitude, hourly, startDate, endDate, daily } = req.query;
  let apiUrl = "";
  if (daily) {
    apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=${hourly}&daily=${daily}&timezone=Asia%2FBangkok`;
  } else {
    apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=${hourly}`;
  }
  const result = await fetchAPI(apiUrl);

  res.json(result);
};

export const crawHistorical= async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db("CCD");

    const countryCollection = db.collection("countries");
    const weatherCollection = db.collection("historical");

    const countries = await countryCollection.find({}).toArray();
    const totalCountries = countries.length;
    let completedCountries = 0;

    const historicalStartDate = "2023-07-29";
    const historicalEndDate = "2023-10-07";

    for (let country of countries) {
      const existingDocs = await weatherCollection.findOne({
          country_id:country.id
      });

      if (!existingDocs) {
        try {
            const data = await fetchAPI( `https://archive-api.open-meteo.com/v1/archive?latitude=16.1667&longitude=107.8333&start_date=2023-09-23&end_date=2023-10-07&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,apparent_temperature,precipitation,rain,snowfall,snow_depth,weathercode,pressure_msl,surface_pressure,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,et0_fao_evapotranspiration,vapor_pressure_deficit,windspeed_10m,windspeed_100m,winddirection_10m,winddirection_100m,windgusts_10m,soil_temperature_0_to_7cm,soil_temperature_7_to_28cm,soil_temperature_28_to_100cm,soil_temperature_100_to_255cm,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_moisture_28_to_100cm,soil_moisture_100_to_255cm&daily=weathercode,temperature_2m_max,temperature_2m_min,temperature_2m_mean,apparent_temperature_max,apparent_temperature_min,apparent_temperature_mean,sunrise,sunset,precipitation_sum,rain_sum,snowfall_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=GMT`);

            if (data.latitude) {
              await weatherCollection.insertOne({
                ...parse(stringify(data)),
                location: {
                  type: "Point",
                  coordinates: [data.longitude, data.latitude],
                },
                country_id:country.id
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
          console.error(`err ${country.name}: ${error}`);
          await new Promise((resolve) => setTimeout(resolve, 60000));
        }
        
      } else {
        console.log(chalk.green(`Doc exist at: ${country.name} `));
      }
      
      completedCountries++;
      console.log(
        chalk.blue(
          `${((completedCountries / totalCountries) * 100).toFixed(2)}%`
        )
      );
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};
