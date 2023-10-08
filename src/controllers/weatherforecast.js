import { fetchAPI } from "../api/fetchApi.js";
export const getWeatherForecast = async (req, res) => {
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
