import axios from "axios";

const API = axios.create({
  baseURL: "https://taskmanager-api-a123-aeb5cmgjebcxcrg9.westeurope-01.azurewebsites.net/api"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;