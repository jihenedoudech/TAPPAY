import axios from "axios";
import config from "../config";

const baseURL = config.API_BASE_URL;

// Create an axios instance
const axiosInstance = axios.create({
  baseURL, // Use the dynamic base URL
  withCredentials: true,
});

// Add a request interceptor to include the token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
