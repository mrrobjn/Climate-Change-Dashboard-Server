import { connectToDatabase } from "../../db/index.js";
import { fetchAPI } from "../../api/fetchApi.js";
import chalk from "chalk";
import { convertToLocalTime } from "../../utils/convertDateTime.js";
import moment from "moment-timezone";
import { PythonShell } from "python-shell";
import { pythonConfig } from "../../config/pythonConfig.js";


export const getAirQuality = async (req, res) => {
  let { latitude, longitude, hourly, start_date, end_date,chart_type } = req.query;
  chart_type = chart_type || "line";
  if (!hourly||!latitude||!longitude) {
   return res.status(400).json({message:"Please complete all information. Do not leave any fields blank."});
} else {
    const client = await connectToDatabase();
    const db = client.db("CCD");
    const collection = db.collection("air-quality");
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const query = {
      'hourly.time': {
        $gte: startDate,
        $lte: endDate,
      },
    };
    const documentExists = await collection.findOne(query) !== null;
    if (documentExists) {
      let options = pythonConfig([latitude, longitude, hourly, start_date, end_date, chart_type]);
      PythonShell.run('AirQuality.py', options)
        .then(results => {
          res.json(JSON.parse(results[0]));
        })
        .catch(error => {
          res.status(401).json({ message: error});
        });
    } else {
      res.status(402).json({ message: "No data exists for the requested time period." });
    }
  }
}
 
export const downloadAirQuality = async (req, res) => {
  let { latitude, longitude, hourly, start_date, end_date } = req.query;

  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);

  const startDate = new Date(moment(start_date).local().format());
  const endDate = new Date(moment(end_date).local().format());

  if (!hourly||!latitude||!longitude) {
    return res.status(400).json({ message: "All parameters cannot be left blank." });
  }

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

  if (start_date && end_date) {
    query['hourly.time'] = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  const result = await collection.findOne(query);

  if (!result) {
    return res.status(404).json({ message: "No data found for the specified location and time period." });
  }

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
  });
};

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
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${country.latitude}&longitude=${country.longitude}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index,uv_index_clear_sky,ammonia,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&start_date=2023-12-18&end_date=2024-01-01`
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
