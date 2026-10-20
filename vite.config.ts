import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // En GitHub Pages se utiliza el subdirectorio del repositorio (/mtc-research-game/)
  // En desarrollo local o compilación descargable se mantiene './' para máxima portabilidad
  const isGitHubPages = process.env.GITHUB_PAGES === 'true' || mode === 'github-pages';
  const base = process.env.VITE_BASE_PATH || (isGitHubPages ? '/mtc-research-game/' : './');

  return {
    plugins: [react()],
    base,
    server: {
      port: 3000,
      open: false
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  };
});
