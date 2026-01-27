import axios from "axios";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://campusflow-backend-9uxk.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;
