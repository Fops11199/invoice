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
    <div className="flex min-h-screen bg-[#f8fafc]">
      <aside className="w-[260px] bg-[#f8fafc] flex flex-col fixed inset-y-0 left-0 z-10 border-r border-slate-200/60">
        <div className="p-8 pb-6">
          <h2 className="text-[1.35rem] font-bold tracking-tight text-slate-900 leading-tight">
            The Ledger
            <span className="block text-sm font-medium text-slate-500 mt-1">Creative Studio</span>
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-2">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 interactive rounded-xl px-4 py-3 text-[0.95rem] font-medium transition-all ${isActive("/dashboard") ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"}`}
          >
            <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
          <Link 
            to="/invoices" 
            className={`flex items-center gap-3 interactive rounded-xl px-4 py-3 text-[0.95rem] font-medium transition-all ${isActive("/invoices") ? "bg-white text-primary shadow-sm border border-slate-200/60" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"}`}
          >
            <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Invoices
          </Link>
          <Link 
            to="/clients" 
            className={`flex items-center gap-3 interactive rounded-xl px-4 py-3 text-[0.95rem] font-medium transition-all ${isActive("/clients") ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"}`}
          >
            <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Clients
          </Link>
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 interactive rounded-xl px-4 py-3 text-[0.95rem] font-medium transition-all ${isActive("/settings") ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"}`}
          >
            <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </nav>
        
        <div className="p-4 mt-auto mb-2 flex flex-col gap-4">
          <Link to="/invoices/new" className="interactive bg-primary rounded-full px-4 py-2.5 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(26,86,219,0.3)] hover:shadow-[0_12px_32px_rgba(26,86,219,0.4)]">
             <span className="text-lg leading-none">+</span> New Invoice
          </Link>
          <div className="interactive bg-blue-100/40 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-blue-100/70 transition-colors" onClick={logout}>
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
               {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[0.9rem] font-bold text-slate-900 leading-tight truncate">{user?.business_name || user?.full_name || "Account"}</p>
               <p className="text-xs text-slate-500 uppercase mt-0.5 tracking-wider font-medium" style={{ fontSize: '0.65rem' }}>{user?.currency || "—"} · Tap to Logout</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-[260px]">
        {children}
      </main>
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
