import axios from "axios";

export const API_BASE_URL = "http://192.168.0.184:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => config,
  (err) => {
    console.error("API Request Error:", err.message);
    return Promise.reject(err);
  },
);

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response) {
      console.error(
        "API Response Error:",
        err.response.status,
        err.response.data,
      );
    } else {
      console.error("API Error:", err.message);
    }
    return Promise.reject(err);
  },
);
