import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Increases the chunk size warning limit from default 500 kB to 1600 kB (1.6 MB)
    chunkSizeWarningLimit: 1600,
  },
})
