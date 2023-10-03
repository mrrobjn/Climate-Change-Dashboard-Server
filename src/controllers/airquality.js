import { fetchAPI } from '../api/fetchApi.js';
export const getAirquality = async (req, res) => {
    const {latitude,longitude,hourly,startDate,endDate}=req.query
    // const latitude=52.52;
    // const longitude=13.41;
    // const hourly ='pm10,pm2_5';
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=${hourly}&start_date=${startDate}&end_date=${endDate}`;
    const result = await fetchAPI(apiUrl)

res.json(result)
}
