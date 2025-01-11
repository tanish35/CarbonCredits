//axios config file
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL 
//|| 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

