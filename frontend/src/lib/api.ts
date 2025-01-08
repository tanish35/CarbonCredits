//axios config file
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: apiUrl as string,
  withCredentials: true,
});
