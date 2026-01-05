import { defineConfig } from 'vite';

export default defineConfig({
  // Base path must match your GitHub repository name
  base: '/LangChat/',
  define: {
    // Injects the API Key during the build process
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});