import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AiExpert from './pages/AiExpert';
import LogList from './pages/LogList';
import LogCreate from './pages/LogCreate';
import HarvestDetail from './pages/HarvestDetail';
import LogDetail from './pages/LogDetail';
import LogEdit from './pages/LogEdit';
import LogComment from './pages/LogComment';
import LogWork from './pages/LogWork';
import Login from './pages/Login';
import GourmetSquare from './pages/GourmetSquare';
import Boast from './pages/Boast';

import Complaint from './pages/Complaint';
import ComplaintCreate from './pages/ComplaintCreate';
import ComplaintDetail from './pages/ComplaintDetail';
import Schedule from './pages/Schedule';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [initialCheckDone, setInitialCheckDone] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      if (!initialCheckDone) {
        setInitialCheckDone(true);
      }
    }
  }, [user, loading, initialCheckDone]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xl font-bold text-brand-primary">농장을 불러오고 있어요...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gourmet" element={<GourmetSquare />} />
        <Route path="/boast" element={<Boast />} />
        <Route path="/ai-expert" element={<AiExpert />} />
        <Route path="/logs" element={<LogList />} />
        <Route path="/logs/:id" element={<LogDetail />} />
        <Route path="/logs/comment/:id" element={<LogComment />} />
        <Route path="/logs/work/:id" element={<LogWork />} />
        <Route path="/logs/create" element={<LogCreate />} />
        <Route path="/logs/edit/:id" element={<LogEdit />} />
        <Route path="/harvest" element={<HarvestDetail />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/complaint/create" element={<ComplaintCreate />} />
        <Route path="/complaint/:id" element={<ComplaintDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/settings" element={<Schedule />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '20px',
              padding: '20px',
            }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
