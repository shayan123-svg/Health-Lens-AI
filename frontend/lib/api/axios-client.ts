import axios from "axios";
import { getClerkToken } from "@/lib/clerk-token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
});

// Request interceptor: attach the current Clerk session JWT.
apiClient.interceptors.request.use(
  (config) => {
    const token = getClerkToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error detail cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "API request failed";
    return Promise.reject(new Error(message));
  }
);
