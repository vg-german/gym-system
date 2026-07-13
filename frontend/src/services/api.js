// src/services/api.js
import axios from 'axios';

// Apuntamos a tu contenedor de Docker / localhost en el puerto 8000
const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;