import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'comprised-wreckage-dorsal.ngrok-free.dev' // Dán cái host bị chặn vào đây
    ]
  }
})