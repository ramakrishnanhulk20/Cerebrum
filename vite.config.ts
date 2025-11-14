import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['@zama-fhe/relayer-sdk'],
  },
  worker: {
    format: 'es',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    open: false,
    headers: {
      // Required for FHEVM RelayerSDK SharedArrayBuffer support
      // Using 'credentialless' to allow third-party resources (Coinbase, etc.)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
});
