import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3001,
    host: true,
    watch: {
      ignored: ['**/research/**', '**/node_modules/**', '**/.git/**'],
    },
  },
  optimizeDeps: {
    entries: ['index.html', 'src/**/*.{ts,tsx}'],
    exclude: ['research'],
  },
});

