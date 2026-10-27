import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // другой порт, чтобы не конфликтовать с desktop
    host: true, // чтобы можно было открыть с телефона в сети
  },
  build: {
    outDir: 'dist',
  },
});