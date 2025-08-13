import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // HMR configuration for Docker
    hmr: {
      protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
      host: process.env.VITE_HMR_HOST || 'localhost',
      port: parseInt(process.env.VITE_HMR_PORT || '24678'),
      clientPort: parseInt(process.env.VITE_HMR_CLIENT_PORT || '24678'),
    },
    // Watch configuration for Docker
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
      interval: 100,
    },
  },
  plugins: [dyadComponentTagger(), 
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core e router
          if (id.includes('react-router-dom') || 
              id.includes('react-router') ||
              id.includes('@remix-run')) {
            return 'react-router';
          }
          
          if (id.includes('react-dom')) {
            return 'react-dom';
          }
          
          if (id.includes('react') && !id.includes('react-dom')) {
            return 'react';
          }

          // UI libraries
          if (id.includes('@radix-ui') || 
              id.includes('@floating-ui')) {
            return 'ui-primitives';
          }
          
          if (id.includes('lucide-react')) {
            return 'icons';
          }

          // Form libraries
          if (id.includes('react-hook-form') || 
              id.includes('@hookform') ||
              id.includes('zod')) {
            return 'forms';
          }

          // Data fetching
          if (id.includes('@tanstack/react-query')) {
            return 'react-query';
          }
          
          if (id.includes('@supabase')) {
            return 'supabase';
          }

          // Editor libraries
          if (id.includes('@tiptap') || 
              id.includes('@lexical') ||
              id.includes('prosemirror')) {
            return 'editor';
          }

          // PDF libraries
          if (id.includes('pdfjs') || 
              id.includes('pdf-lib') ||
              id.includes('@react-pdf')) {
            return 'pdf';
          }

          // Chart libraries
          if (id.includes('recharts') || 
              id.includes('d3') ||
              id.includes('chart')) {
            return 'charts';
          }

          // Date utilities
          if (id.includes('date-fns') || 
              id.includes('dayjs') ||
              id.includes('moment')) {
            return 'date-utils';
          }

          // Utils
          if (id.includes('clsx') || 
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority')) {
            return 'style-utils';
          }

          // Specific heavy libraries
          if (id.includes('html2canvas') || 
              id.includes('jspdf')) {
            return 'export-utils';
          }

          if (id.includes('sonner') || 
              id.includes('react-hot-toast')) {
            return 'notifications';
          }

          // CODEMA specific modules
          if (id.includes('pages/codema')) {
            return 'codema';
          }

          // Admin modules  
          if (id.includes('pages/admin')) {
            return 'admin';
          }

          // FMA module
          if (id.includes('pages/fma')) {
            return 'fma';
          }

          // Common components
          if (id.includes('components/common')) {
            return 'common-components';
          }

          // Auth components
          if (id.includes('components/auth')) {
            return 'auth';
          }
        },
        // Otimizações de output
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/${chunkInfo.name}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const extType = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|ttf|eot/i.test(extType || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Better source maps for production debugging
    sourcemap: mode === 'production' ? 'hidden' : true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Target modern browsers for smaller bundle
    target: 'es2020',
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'date-fns',
      'react-hook-form',
      'zod'
    ],
    exclude: ['@dyad-sh/react-vite-component-tagger'],
  },
  // Enable caching of transformed modules
  cacheDir: 'node_modules/.vite',
}));