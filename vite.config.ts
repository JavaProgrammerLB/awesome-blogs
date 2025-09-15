import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // When using a custom domain (CNAME), assets should be served from root.
  // Previously set to "/awesome-blogs/" which causes 404s on custom domain.
  base: '/',
})
