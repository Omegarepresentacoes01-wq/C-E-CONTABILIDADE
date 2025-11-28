import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to resolve 'Property cwd does not exist on type Process' error
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // Fix: Define process.env.API_KEY to be available in the client, mapping from VITE_GEMINI_API_KEY
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});