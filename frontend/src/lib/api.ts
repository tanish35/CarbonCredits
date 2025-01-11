//axios config file
import axios from "axios";

export const api = axios.create({
  baseURL: "https://carboncredits-pjr8.onrender.com/api",
  withCredentials: true,
});
