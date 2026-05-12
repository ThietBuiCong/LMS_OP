import axios from 'axios';

// Dán link ngrok / localtunnel / IP của bạn vào đây
const api = axios.create({
  baseURL: '  https://comprised-wreckage-dorsal.ngrok-free.dev', // <-- DÁN LINK VÀO ĐÂY
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;