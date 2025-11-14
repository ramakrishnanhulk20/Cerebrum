/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALCHEMY_API_KEY?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  // add other VITE_ env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Window ethereum provider type
interface Window {
  ethereum?: any;
  RelayerSDK?: any;
  relayerSDK?: any;
}

// CDN imports
declare module 'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js' {
  export const initSDK: () => Promise<void>;
  export const createInstance: (config: any) => Promise<any>;
  export const SepoliaConfig: any;
}
