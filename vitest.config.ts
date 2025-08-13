import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json', 'lcov'],
      include: [
        'src/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/mocks/**',
        'src/setupTests.ts',
        'src/vite-env.d.ts',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/App.tsx',
        'src/integrations/supabase/types.ts',
        'src/integrations/supabase/generated-types.ts',
      ],
      all: true,
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 70,
          statements: 70,
        },
      },
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    isolate: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
});

