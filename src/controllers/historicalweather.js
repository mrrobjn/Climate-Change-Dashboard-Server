import { fetchAPI } from "../api/fetchApi.js";
export const getHistoricalWeather = async (req, res) => {
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
