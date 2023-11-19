import { stringify, parse } from "flatted";
import { connectToDatabase } from "../db/index.js";
import { fetchAPI } from "../api/fetchApi.js";
import chalk from "chalk";
import { convertToLocalTime } from "../utils/convertDateTime.js";
import moment from "moment-timezone";
import { PythonShell } from "python-shell";
import path from "path";
import url from 'url';
import { pythonConfig } from "../config/pythonConfig.js";
import { error } from "console";


export const getHistorical = async (req, res) => {
  let { latitude, longitude, hourly, daily , start_date, end_date,chart_type} = req.query;
  chart_type = chart_type || "line";
  let options = pythonConfig([latitude, longitude, hourly, daily , start_date, end_date,chart_type])
  PythonShell.run('Historical.py', options).then(results=>{
    res.json(results[0]);
  });
};

export const crawHistorical = async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db("CCD");

    const countryCollection = db.collection("countries");
    const weatherCollection = db.collection("historical");

    const countries = await countryCollection.find({}).toArray();
    const totalCountries = countries.length;
    let completedCountries = 0;

    const historicalStartDate = "2022-07-29";
    const historicalEndDate = "2023-10-07";

    for (let country of countries) {
      const existingDocs = await weatherCollection.findOne({
        country_id: country.id,
      });

      if (!existingDocs) {
        try {
          const data = await fetchAPI(
            `https://archive-api.open-meteo.com/v1/archive?latitude=${country.latitude}&longitude=${country.longitude}&start_date=${historicalStartDate}&end_date=${historicalEndDate}&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,apparent_temperature,precipitation,rain,snowfall,snow_depth,weathercode,pressure_msl,surface_pressure,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,et0_fao_evapotranspiration,vapor_pressure_deficit,windspeed_10m,windspeed_100m,winddirection_10m,winddirection_100m,windgusts_10m,soil_temperature_0_to_7cm,soil_temperature_7_to_28cm,soil_temperature_28_to_100cm,soil_temperature_100_to_255cm,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_moisture_28_to_100cm,soil_moisture_100_to_255cm&daily=weathercode,temperature_2m_max,temperature_2m_min,temperature_2m_mean,apparent_temperature_max,apparent_temperature_min,apparent_temperature_mean,sunrise,sunset,precipitation_sum,rain_sum,snowfall_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=GMT`
          );

          if (data.latitude) {
            data.hourly.time = data.hourly.time.map((time) => new Date(time));
            data.daily.time = data.daily.time.map((time) => new Date(time));
            await weatherCollection.insertOne({
              latitude: data.latitude,
              longitude: data.longitude,
              generationtime_ms: data.generationtime_ms,
              timezone :data.timezone, 
              timezone_abbreviation: data.timezone_abbreviation,
              elevation: data.elevation,
              hourly_units: data.hourly_units,
              hourly: data.hourly,
              daily_units: data.daily_units,
              daily: data.daily,
              location: {
                type: "Point",
                coordinates: [data.longitude, data.latitude],
              },
              country_id: country.id,
            });
            console.log(chalk.green(`success at: ${country.name}`));
          } else {
            console.log(
              chalk.red(
                "error while fetching for " + country.name + ": " + data.message
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
