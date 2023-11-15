import { connectToDatabase } from "../../db/index.js";
import { fetchAPI } from "../../api/fetchApi.js";
import chalk from "chalk";
import { PythonShell } from "python-shell";
import { pythonConfig } from "../../config/pythonConfig.js";

export const getForecast = async (req, res) => {
  let { latitude, longitude, hourly, daily } = req.query;
  let options = pythonConfig([latitude, longitude, hourly, daily])
  PythonShell.run('Forecast.py', options).then(results=>{
    res.json(results[0]);
  });
};

export const crawForecast = async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db("CCD");

    const countryCollection = db.collection("countries");
    const weatherCollection = db.collection("forecast");

    const currentDate = new Date();
    const countries = await countryCollection.find({}).toArray();
    const weather = await weatherCollection.find({}).toArray();

    const totalCountries = countries.length;
    let completedCountries = 0;

    for (let country of countries) {
      try {
        const data = await fetchAPI(
          `https://api.open-meteo.com/v1/forecast?latitude=${country.latitude}&longitude=${country.longitude}&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weathercode,pressure_msl,surface_pressure,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapor_pressure_deficit,windspeed_10m,windspeed_80m,windspeed_120m,windspeed_180m,winddirection_10m,winddirection_80m,winddirection_120m,winddirection_180m,windgusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=GMT`
        );

        if (data.latitude) {
          for (let i = 0; i < weather.length; i++) {
            const countryID = country.country_id;
            const weath = weather[i];
            if (data.latitude) {
              for (let j = 0; j < weath.daily.time.length; j++) {
                const dailyDate = new Date(weath.daily.time[j]);
                const today = new Date(currentDate);
                //nếu xóa all dữ liệu r cào lại thì thêm = vô
                if (dailyDate < today) {
                  // console.log('Ngay cu da xoa: ', weath.daily.time[j]);
                  // console.log(`id:${ countryID}`);
                  const result = await weatherCollection.deleteOne({
                    country_id: countryID,
                  });
                  // db.weatherCollection.remove({
                  //     country_id: countryID,
                  // })
                  console.log(`remove data for :${country.name}`);
                  // console.log('removed:',result);
                  break;
                }
              }
            }
          }
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
            date: currentDate,
          });

          console.log(chalk.green(`Inserted data for: ${country.name}`));
        } else {
          console.log(
            chalk.red(
              "Error while fetching for " +
                country.name +
                ": " +
                JSON.stringify(data, null, 2)
            )
          );
        }
      } catch (error) {
        console.error(`Error for ${country.name}: ${error}`);
        await new Promise((resolve) => setTimeout(resolve, 60000));
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
