import { fetchAPI } from '../api/fetchApi.js';
export const getHistoricalWeather = async (req, res) => {
    const {latitude,longitude,hourly,startDate,endDate,daily}=req.query
    // const latitude=52.52;
    // const longitude=13.41;
    // const hourly ='pm10,pm2_5';
    // const startDate='2023-09-14';
    // const endDate='2023-09-28';
    // const daily='weathercode';
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}& hourly=${hourly}&daily=${daily}&timezone=Asia%2FBangkok`;
    const result = await fetchAPI(apiUrl)

res.json(result)
}
