import { connectToDatabase } from "../../db/index.js";
import { fetchAPI } from "../../api/fetchApi.js";
import chalk from "chalk";
import { convertToLocalTime } from "../../utils/convertDateTime.js";
import moment from "moment-timezone";
import { PythonShell } from "python-shell";
import path from "path";
import url from 'url';
import { pythonConfig } from "../../config/pythonConfig.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const getAirQuality = async (req, res) => {
  let { latitude, longitude, hourly, start_date, end_date } = req.query;
  let options = pythonConfig([latitude, longitude, hourly, start_date, end_date])
  PythonShell.run('AirQuality.py', options).then(results=>{
    res.json(results[0]);
  });
};

export const downloadAirQuality = async(req,res)=>{
  let { latitude, longitude, hourly, start_date, end_date } = req.query;

  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  let startDate = new Date(moment(start_date).local().format());
  let endDate = new Date(moment(end_date).local().format());
  const client = await connectToDatabase();
  const db = client.db("CCD");

  const collection = db.collection("air-quality");
  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
    },
  };
  const result = await collection.findOne(query)
  const hourlyArray = hourly.split(",");
  const hourly_units = {};

  for (const unit of hourlyArray) {
    if (result.hourly_units.hasOwnProperty(unit)) {
      hourly_units[unit] = result.hourly_units[unit];
    }
  }
  let newTimeArray = [];

  const hourlyData = {};
    for (const unit of hourlyArray) {
      if (result.hourly.hasOwnProperty(unit)) {
        let filteredData = [];
        for (let i = 0; i < result.hourly.time.length; i++) {
          let currentTime = new Date(result.hourly.time[i]);
          if (currentTime >= startDate && currentTime <= endDate) {
            filteredData.push(result.hourly[unit][i]);
          }
        }
        hourlyData[unit] = filteredData;
      }
    }
    for (let i = 0; i < result.hourly.time.length; i++) {
      let currentTime = new Date(result.hourly.time[i]);
      if (currentTime >= startDate && currentTime <= endDate) {
        newTimeArray.push(currentTime);
      }
    }
    res.json({
      hourly_units,
      hourly: { ...hourlyData, time: convertToLocalTime(newTimeArray) },
    });}
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
            data.hourly.time = data.hourly.time.map((time) => new Date(time));
            await db2.insertOne({
              latitude: data.latitude,
              longitude: data.longitude,
              generationtime_ms: data.generationtime_ms,
              timezone :data.timezone, 
              timezone_abbreviation: data.timezone_abbreviation,
              elevation: data.elevation,
              hourly_units: data.hourly_units,
              hourly: data.hourly,
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
