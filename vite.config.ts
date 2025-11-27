import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use '.' instead of process.cwd() to avoid TypeScript errors with Process type
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Garante que process.env.API_KEY funcione no build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});