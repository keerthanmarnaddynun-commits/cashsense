import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { ActionsPage } from './pages/ActionsPage';
import { ScenarioLabPage } from './pages/ScenarioLabPage';
import { CopilotPage } from './pages/CopilotPage';
import { SettingsPage } from './pages/SettingsPage';
import { getFinancials } from './services/api';

function AppRoutes() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await getFinancials();
        setConnectionStatus('connected');
      } catch (err) {
        console.error(err);
        setConnectionStatus('error');
      }
    };
    checkConnection();
  }, []);

  return (
    <Routes>
      {/* Authentication screens */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Verify email is a protected path but allows unverified access */}
      <Route
        path="/verify-email"
        element={
          <ProtectedRoute allowUnverified={true}>
            <VerifyEmail />
          </ProtectedRoute>
        }
      />

      {/* Main SaaS panel outlets protected by validation state */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout connectionStatus={connectionStatus} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/scenario-lab" element={<ScenarioLabPage />} />
        <Route path="/copilot" element={<CopilotPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Route fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
