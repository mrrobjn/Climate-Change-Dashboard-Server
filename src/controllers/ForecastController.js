import { fetchAPI } from "../api/fetchApi.js";
import chalk from "chalk";
import { connectToDatabase } from "../db/index.js";
import { stringify,parse } from "flatted";
export const getForecast = async (req, res) => {
  const { latitude, longitude, hourly, daily } = req.query;
  let apiUrl = "";
  if (daily) {
    apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${hourly}&daily=${daily}&timezone=Asia%2FBangkok`;
  } else {
    apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${hourly}&timezone=Asia%2FBangkok`;
  }
  const result = await fetchAPI(apiUrl);

  res.json(result);
};

// cào dữ liệu dự đoán thời tiết
export const crawForecast= async (req, res) => {
  try {
    const currentDate = new Date();
    const client = await connectToDatabase();
    const db = client.db("CCD");

    const countryCollection = db.collection("countries");
    const weatherCollection = db.collection("forecast");

    const countries = await countryCollection.find({}).toArray();
    const totalCountries = countries.length;
    let completedCountries = 0;
    //chỗ này xóa dữ liệu cũ trước ngày hiện tại
    await weatherCollection.deleteMany({
      date: { $lt: currentDate }
    });

    for (let country of countries) {
      const existingDocs = await weatherCollection.findOne({
          country_id:country.id,
          date: currentDate
      });

      if (!existingDocs) {
        try {
            const data = await fetchAPI( `https://api.open-meteo.com/v1/forecast?latitude=${country.latitude}&longitude=${country.longitude}&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weathercode,pressure_msl,surface_pressure,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapor_pressure_deficit,windspeed_10m,windspeed_80m,windspeed_120m,windspeed_180m,winddirection_10m,winddirection_80m,winddirection_120m,winddirection_180m,windgusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=GMT`);

            if (data.latitude) {
              data.date = currentDate;
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
