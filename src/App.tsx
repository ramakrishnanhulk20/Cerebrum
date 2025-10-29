import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import LenderPortal from './pages/LenderPortal';
import ResearcherPortal from './pages/ResearcherPortal';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10, 22, 40, 0.95)',
            color: '#fff',
            border: '1px solid rgba(0, 230, 160, 0.3)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#00e6a0',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/lender" element={<LenderPortal />} />
        <Route path="/researcher" element={<ResearcherPortal />} />
      </Routes>
    </div>
  );
}

export default App;
