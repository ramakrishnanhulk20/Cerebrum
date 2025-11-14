import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import { AppRoutes } from './routes';
import { useInitFhevm } from './hooks/useInitFhevm';

function App() {
  // Initialize FHEVM when wallet connects (with console logs)
  useInitFhevm();

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.95)',
            color: '#fff',
            border: '1px solid rgba(0, 230, 160, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(0, 230, 160, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#00e6a0',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(0, 230, 160, 0.5)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.5)',
            },
          },
          loading: {
            iconTheme: {
              primary: '#00e6a0',
              secondary: '#000',
            },
          },
        }}
      />
      <AppRoutes />
    </div>
  );
}

export default App;
