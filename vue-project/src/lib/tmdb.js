import axios from "axios";
const client = axios.create({ baseURL: "https://api.themoviedb.org/3", timeout: 15000 });
export async function getTitles(endpoint, params = {}, signal) {
  const { data } = await client.get(endpoint, {
    signal,
    params: {
      api_key: import.meta.env.VITE_TMDB_API_KEY,
      language: "en-US",
      include_adult: false,
      ...params,
    },
  });
  return data;
}
export const isCancelled = (error) => axios.isCancel(error) || error.name === "AbortError";
