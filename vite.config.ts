import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // For development: ensure all /admin/* routes fall back to index.html
    proxy: {
      '/admin': {
        target: 'http://localhost:8080',
        rewrite: (path) => path.replace(/^\/admin/, '')
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // For production: ensure the build outputs support /admin/ routing
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: `admin/assets/[name].[hash].js`,
        chunkFileNames: `admin/assets/[name].[hash].js`,
        assetFileNames: `admin/assets/[name].[hash].[ext]`
      }
    }
  },
  
  // Base path for production (if deployed in subdirectory)
  base: mode === 'production' ? '/admin/' : '/'
}));