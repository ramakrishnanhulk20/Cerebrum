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
      // Base Account SDK requires 'same-origin-allow-popups' instead of 'same-origin'
      // This allows the SDK to communicate with wallet popups (MetaMask, Coinbase)
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
});
