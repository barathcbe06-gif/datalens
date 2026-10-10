import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DatasetProvider } from './context/DatasetContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';

const AppLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 w-full overflow-x-hidden">
      {!isLandingPage && <Navbar />}
      <div className="flex-1 flex w-full relative">
        {!isLandingPage && <Sidebar />}
        <main className={`flex-1 min-w-0 w-full ${isLandingPage ? 'p-0' : 'px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto'}`}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<DashboardPage defaultTab="overview" />} />
            <Route path="/quality" element={<DashboardPage defaultTab="quality" />} />
            <Route path="/eda" element={<DashboardPage defaultTab="eda" />} />
            <Route path="/visualizations" element={<DashboardPage defaultTab="viz" />} />
            <Route path="/insights" element={<DashboardPage defaultTab="insights" />} />
            <Route path="/ask" element={<DashboardPage defaultTab="ask" />} />
            <Route path="/ml" element={<DashboardPage defaultTab="automl" />} />
            <Route path="/explain" element={<DashboardPage defaultTab="explain" />} />
            <Route path="/outliers" element={<DashboardPage defaultTab="outliers" />} />
            <Route path="/forecasting" element={<DashboardPage defaultTab="forecasting" />} />
            <Route path="/report" element={<DashboardPage defaultTab="report" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <DatasetProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </DatasetProvider>
  );
}

export default App;
