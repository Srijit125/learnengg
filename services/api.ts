import axios from "axios";

export const API_BASE_URL = "http://192.168.0.184:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (res) => res,
  (err) => {
    console.error("API Request Error:", err.response.data || err.message);
    return Promise.reject(err);
  },
);
