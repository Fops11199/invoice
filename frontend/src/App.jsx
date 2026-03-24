import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ClientProvider } from "./context/ClientContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import ClientDetailPage from "./pages/ClientDetailPage";
import ClientsPage from "./pages/ClientsPage";
import DashboardPage from "./pages/DashboardPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import InvoicesPage from "./pages/InvoicesPage";
import LoginPage from "./pages/LoginPage";
import NewInvoicePage from "./pages/NewInvoicePage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import HomePage from "./pages/HomePage";

function Shell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMarketingRoute = location.pathname === "/";
  const isActive = (path) => location.pathname.startsWith(path);

  if (!user || isMarketingRoute) return children;
  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-4 border-b bg-white p-3">
        <Link to="/dashboard" className={`interactive rounded-full px-3 py-1 ${isActive("/dashboard") ? "bg-blue-50 text-primary" : ""}`}>Dashboard</Link>
        <Link to="/invoices" className={`interactive rounded-full px-3 py-1 ${isActive("/invoices") ? "bg-blue-50 text-primary" : ""}`}>Invoices</Link>
        <Link to="/clients" className={`interactive rounded-full px-3 py-1 ${isActive("/clients") ? "bg-blue-50 text-primary" : ""}`}>Clients</Link>
        <Link to="/settings" className={`interactive rounded-full px-3 py-1 ${isActive("/settings") ? "bg-blue-50 text-primary" : ""}`}>Settings</Link>
        <button className="interactive ml-auto rounded-full border px-4 py-1" onClick={logout}>
          Logout
        </button>
      </nav>
      {children}
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AuthProvider>
      <ClientProvider>
        <InvoiceProvider>
          <Shell>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <Routes location={location}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/register" element={<RegisterPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                  <Route path="/invoices/new" element={<ProtectedRoute><NewInvoicePage /></ProtectedRoute>} />
                  <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
                  <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                  <Route path="/clients/:id" element={<ProtectedRoute><ClientDetailPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Shell>
        </InvoiceProvider>
      </ClientProvider>
    </AuthProvider>
  );
}
