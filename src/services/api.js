import axios from "axios";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : `http://${window.location.hostname}:5000/api`;

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;
