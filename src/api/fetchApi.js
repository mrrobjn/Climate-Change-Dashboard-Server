import axios from "axios";

export const fetchAPI = async (api) => {
  try {
    const response = await axios.get(api);
    return response.data;
  } catch (error) {
    return error;
  }
};
