import axios from "axios";
import { API_BASE } from "../config";

const API = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Friendly error messages for History and other pages
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
      err.friendlyMessage = "Cannot reach the server. Make sure the backend is running (e.g. python app.py in the backend folder).";
    } else if (err.response?.status === 503) {
      err.friendlyMessage = err.response?.data?.message || "Service temporarily unavailable. The database may be connecting.";
    } else if (err.response?.status === 401) {
      err.friendlyMessage = "Session expired. Please sign in again.";
    }
    return Promise.reject(err);
  }
);

export const predictCancer = async (formData) => {
  const res = await API.post("/api/predict", formData);
  return res.data;
};

export const fetchHistory = async () => {
  const res = await API.get("/api/history");
  return res.data;
};

export default API;
