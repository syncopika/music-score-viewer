import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// https://stackoverflow.com/questions/74620427/how-to-configure-vite-to-allow-jsx-syntax-in-js-files
export default defineConfig({
  plugins: [react()],
  esbuild: {
    include: /\.jsx?$/,
    exclude: [],
    loader: 'jsx',
  },
});
