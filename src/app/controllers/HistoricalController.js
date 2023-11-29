import { connectToDatabase } from "../../db/index.js";
import { fetchAPI } from "../../api/fetchApi.js";
import chalk from "chalk";
import { PythonShell } from "python-shell";
import { pythonConfig } from "../../config/pythonConfig.js";
import moment from "moment-timezone";
import { convertToLocalTime } from "../../utils/convertDateTime.js";

export const getHistorical = async (req, res) => {
  let { latitude, longitude, hourly, daily, start_date, end_date, chart_type } = req.query;
  chart_type = chart_type || "line";
  if (!hourly &&!daily) {
    return res.status(400).json({ message: "Must select at least one data type (hourly or daily)." });
  }else{
    const client = await connectToDatabase();
    const db = client.db("CCD");
    const collection = db.collection("historical");
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
      let options = pythonConfig([latitude, longitude, hourly,daily, start_date, end_date, chart_type]);
      PythonShell.run('Historical.py', options)
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

};
export const downloadHistorical = async (req, res) => {
  let { latitude, longitude, hourly, daily, start_date, end_date } = req.query;

  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  let startDate = new Date(moment(start_date).local().format());
  let endDate = new Date(moment(end_date).local().format());
  const client = await connectToDatabase();
  const db = client.db("CCD");

  const collection = db.collection("historical");
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
  const result = await collection.findOne(query);

  // Kiểm tra nếu có trường daily thì xử lý daily, ngược lại xử lý hourly
  if (daily) {
    const dailyArray = daily.split(",");
    const daily_units = {};
    for (const unit of dailyArray) {
      if (result.daily_units.hasOwnProperty(unit)) {
        daily_units[unit] = result.daily_units[unit];
      }
    }

    const dailyData = {};
    for (const unit of dailyArray) {
      if (result.daily.hasOwnProperty(unit)) {
        let filteredData = [];
        for (let i = 0; i < result.daily.time.length; i++) {
          let currentTime = new Date(result.daily.time[i]);
          if (currentTime >= startDate && currentTime <= endDate) {
            filteredData.push(result.daily[unit][i]);
          }
        }
        dailyData[unit] = filteredData;
      }
    }

    let newDailyTimeArray = [];
    for (let i = 0; i < result.daily.time.length; i++) {
      let currentTime = new Date(result.daily.time[i]);
      if (currentTime >= startDate && currentTime <= endDate) {
        newDailyTimeArray.push(currentTime);
      }
    }

    res.json({
      daily_units,
      daily: { ...dailyData, time: convertToLocalTime(newDailyTimeArray) },
    });
  } else {
    const hourlyArray = hourly.split(",");
    const hourly_units = {};
    for (const unit of hourlyArray) {
      if (result.hourly_units.hasOwnProperty(unit)) {
        hourly_units[unit] = result.hourly_units[unit];
      }
    }

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

    let newTimeArray = [];
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
  }
}


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
