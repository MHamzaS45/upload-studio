import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Compile React and Tailwind through the Vite pipeline.

export default defineConfig({
  plugins: [react(), tailwindcss()],
})