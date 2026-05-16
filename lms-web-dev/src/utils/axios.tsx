import axios from 'axios';

// Nếu có biến VITE_API_URL (khi lên mạng) thì dùng, không thì tự động lùi về localhost (khi test máy)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

export default api;