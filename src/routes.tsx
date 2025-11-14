import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader } from 'lucide-react';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const ResearcherPortal = lazy(() => import('./pages/ResearcherPortal'));
const LenderPortal = lazy(() => import('./pages/LenderPortal'));
const DocsPage = lazy(() => import('./pages/DocsPage'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/researcher" element={<ResearcherPortal />} />
        <Route path="/lender" element={<LenderPortal />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </Suspense>
  );
};
