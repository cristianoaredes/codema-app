import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Changed from "::" to "0.0.0.0" for better Docker compatibility
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
          // React core: dividir em chunks muito menores
          if (id.includes('react-dom/client') || 
              id.includes('react-dom/server')) {
            return 'react-dom-runtime';
          }
          
          // React DOM features separados
          if (id.includes('react-dom/unstable_testing-utils') ||
              id.includes('react-dom/test-utils')) {
            return 'react-dom-test';
          }
          
          if (id.includes('react-dom')) {
            return 'react-dom';
          }
          
          // React JSX separado
          if (id.includes('react/jsx-runtime') || 
              id.includes('react/jsx-dev-runtime')) {
            return 'react-jsx';
          }
          
          // React core dividido por features
          if (id.includes('react/scheduler') ||
              id.includes('scheduler')) {
            return 'react-scheduler';
          }
          
          if (id.includes('react') && 
              (id.includes('reconciler') || id.includes('fiber'))) {
            return 'react-reconciler';
          }
          
          // React DevTools
          if (id.includes('react') && id.includes('devtools')) {
            return 'react-devtools';
          }
          
          // React internals
          if (id.includes('react') && 
              (id.includes('shared') || id.includes('is-valid-element'))) {
            return 'react-shared';
          }
          
          // React hooks
          if (id.includes('react') && id.includes('hooks')) {
            return 'react-hooks';
          }
          
          if (id.includes('react') && !id.includes('react-dom')) {
            return 'react-core';
          }

          // Router: separar do React core
          if (id.includes('react-router-dom') || 
              id.includes('react-router') ||
              id.includes('@remix-run')) {
            return 'react-router';
          }

          // UI libraries: dividir em categorias menores
          if (id.includes('@radix-ui/react-dialog') ||
              id.includes('@radix-ui/react-dropdown-menu') ||
              id.includes('@radix-ui/react-popover')) {
            return 'ui-dialogs';
          }
          
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
          
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase-client';
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

          // PDF libraries: separar minuciosamente
          if (id.includes('@react-pdf/renderer')) {
            return 'pdf-renderer';
          }
          
          if (id.includes('pdfjs-dist/legacy/build/pdf')) {
            return 'pdfjs-core';
          }
          
          if (id.includes('pdfjs-dist/web/pdf_viewer')) {
            return 'pdfjs-viewer';
          }
          
          if (id.includes('pdfjs') || 
              id.includes('pdf-lib')) {
            return 'pdf-utils';
          }
          
          // Separar PDF workers
          if (id.includes('pdfjs-dist') && id.includes('worker')) {
            return 'pdf-worker';
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

          // Utils: dividir por tipo
          if (id.includes('tailwind-merge') ||
              id.includes('class-variance-authority')) {
            return 'style-utils';
          }
          
          if (id.includes('clsx') || 
              id.includes('classnames')) {
            return 'class-utils';
          }

          // Export utilities
          if (id.includes('html2canvas') || 
              id.includes('jspdf')) {
            return 'export-utils';
          }

          // Notifications
          if (id.includes('sonner') || 
              id.includes('react-hot-toast')) {
            return 'notifications';
          }

          // Feature-specific modules: dividir CODEMA por sub-módulos
          if (id.includes('pages/codema/atas') ||
              id.includes('components/codema/atas')) {
            return 'codema-atas';
          }
          
          if (id.includes('pages/codema/conselheiros') ||
              id.includes('components/codema/conselheiros')) {
            return 'codema-conselheiros';
          }
          
          if (id.includes('pages/codema/resolucoes') ||
              id.includes('components/codema/resolucoes')) {
            return 'codema-resolucoes';
          }
          
          if (id.includes('pages/codema/auditoria') ||
              id.includes('pages/codema/protocolos')) {
            return 'codema-admin';
          }
          
          // CODEMA core components
          if (id.includes('pages/codema') ||
              id.includes('components/codema')) {
            return 'codema-core';
          }

          if (id.includes('pages/admin') ||
              id.includes('components/admin')) {
            return 'admin';
          }

          if (id.includes('pages/fma') ||
              id.includes('components/fma')) {
            return 'fma';
          }

          if (id.includes('pages/ouvidoria') ||
              id.includes('components/ouvidoria')) {
            return 'ouvidoria';
          }

          // Componentes compartilhados
          if (id.includes('components/common')) {
            return 'common-components';
          }

          // Auth components divididos
          if (id.includes('components/auth') && 
              (id.includes('AuthPage') || id.includes('AuthForm'))) {
            return 'auth-forms';
          }
          
          if (id.includes('components/auth') && 
              (id.includes('ProtectedRoute') || id.includes('middleware'))) {
            return 'auth-guards';
          }
          
          if (id.includes('components/auth')) {
            return 'auth-core';
          }

          if (id.includes('components/ui')) {
            return 'ui-components';
          }

          // Node modules grandes específicos
          if (id.includes('node_modules') && 
              (id.includes('firebase') || 
               id.includes('aws-sdk') ||
               id.includes('lodash'))) {
            return 'vendor-heavy';
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
    // Module preload polyfill for better loading
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => {
        // Preload critical modules
        if (filename.includes('index') || filename.includes('Dashboard')) {
          return deps.filter(dep => 
            dep.includes('react-core') || 
            dep.includes('ui-components') ||
            dep.includes('common-components')
          );
        }
        return [];
      }
    },
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