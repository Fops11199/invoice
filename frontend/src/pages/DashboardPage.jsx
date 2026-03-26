import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { getDashboardStatsApi } from "../api/dashboard";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const currency = user?.currency || "XAF";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getDashboardStatsApi();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p className="text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Earned", value: `${data?.total_earned?.toLocaleString() ?? 0} ${currency}` },
    { label: "Outstanding", value: `${data?.outstanding?.toLocaleString() ?? 0} ${currency}` },
    { label: "Overdue", value: `${data?.overdue?.toLocaleString() ?? 0} ${currency}` },
    { label: "Clients", value: `${data?.client_count ?? 0}` },
  ];

  return (
    <motion.div
      className="p-8 space-y-10 max-w-[1240px] mx-auto"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">Dashboard</h1>
          <p className="mt-1 text-slate-500">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/clients" className="interactive rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            Add Client
          </Link>
          <Link to="/invoices/new" className="interactive rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,86,219,0.24)] hover:shadow-[0_12px_32px_rgba(26,86,219,0.35)] flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Create Invoice
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.article
            key={stat.label}
            className="interactive-card rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-center min-h-[140px]"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.04 * index, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-2xl font-black tracking-tight text-slate-900 leading-none">{stat.value}</p>
          </motion.article>
        ))}
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Invoices</h2>
            <Link to="/invoices" className="text-sm font-bold text-primary hover:text-blue-700 transition-colors">View All &rarr;</Link>
        </div>
        {data?.recent_invoices && data.recent_invoices.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.recent_invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                className="interactive flex items-center justify-between gap-4 p-5 hover:bg-slate-50/50 transition-colors"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.03, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <div>
                  <Link className="font-bold text-slate-900 hover:text-primary transition-colors text-[0.95rem]" to={`/invoices/${invoice.id}`}>
                    {invoice.invoice_number}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">{new Date(invoice.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-1 rounded text-[0.6rem] font-bold tracking-wider inline-block ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : invoice.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {invoice.status.toUpperCase()}
                  </span>
                  <span className="text-[0.95rem] font-black text-slate-900">{invoice.total.toLocaleString()} {currency}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 bg-slate-50/30 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-sm font-medium">No recent invoices found.</p>
            <Link to="/invoices/new" className="text-primary font-bold text-sm hover:underline mt-1">Create your first invoice</Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
