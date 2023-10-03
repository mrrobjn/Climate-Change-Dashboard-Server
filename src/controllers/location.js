import { fetchAPI } from '../api/fetchApi.js';
export const getLocation = async (req, res) => {
     const { name } = req.query
    //const name = 'vietnam';
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${name}&count=5&language=en&format=json`;
    const result = await fetchAPI(apiUrl)

    res.json(result)
}
