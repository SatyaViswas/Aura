import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-oxc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true, // Forces Vite to strictly use 5173 so localtunnel never loses it
    // 👈 Change this from the array to just true
  }
})
