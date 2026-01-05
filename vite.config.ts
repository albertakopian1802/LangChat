import { defineConfig } from 'vite';

export default defineConfig({
  // Using relative base path makes the deployment agnostic to the sub-folder name
  base: './',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});