import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for React and Tailwind. It doesn't define any custom
// aliases; the default behaviour resolves modules from node_modules and src.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});