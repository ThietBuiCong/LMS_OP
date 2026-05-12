import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// App.tsx
import axios from 'axios';

// Khi chạy thật, VITE_API_URL sẽ được lấy từ file .env
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
