import { fetchAPI } from '../api/fetchApi.js';
export const getWeatherForecast = async (req, res) => {
    
    const {latitude,longitude,hourly,forecastDays}=req.query
    // const latitude=52.52;
    // const longitude=13.41;
    // const hourly ='pm10,pm2_5';
    // const forecastDays=7;
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=${hourly}&timezone=Asia%2FBangkok&forecast_days=${forecastDays}`;
    const result = await fetchAPI(apiUrl)

res.json(result)
}
