import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { downloadInvoicePdfApi, updateInvoiceStatusApi, sendInvoiceApi } from "../api/invoices";
import { Badge } from "../components/ui/Badge";

export default function InvoicesPage() {
  const { invoices, refreshInvoices } = useInvoices();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState("All Invoices");
  const [actionLoading, setActionLoading] = useState(null);

  const currency = user?.currency || "XAF";

  const handleAction = async (id, fn) => {
    setActionLoading(id);
    try {
      await fn();
      await refreshInvoices();
    } catch {
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const downloadPdf = async (id, number) => {
    const { data } = await downloadInvoicePdfApi(id);
    const blob = new Blob([data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${number}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = ["All Invoices", "Draft", "Sent", "Paid", "Overdue"];
  
  const getFiltered = () => {
    if (activeTab === "All Invoices") return invoices;
    const s = activeTab.toLowerCase();
    return invoices.filter(i => i.status === s);
  };

  const displayed = getFiltered();
  const totalOutstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((sum, i) => sum + (i.total || 0), 0);
  const revenueMtd = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + (i.total || 0), 0);

  const statusCounts = {
    draft: invoices.filter(i => i.status === "draft").length,
    sent: invoices.filter(i => i.status === "sent").length,
    paid: invoices.filter(i => i.status === "paid").length,
    overdue: invoices.filter(i => i.status === "overdue").length,
  };

  return (
    <motion.div
      className="p-8 max-w-[1240px] mx-auto"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">Invoices</h1>
          <p className="text-slate-500 mt-1">Manage your billing and client payments.</p>
        </div>
        <Link to="/invoices/new" className="interactive rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,86,219,0.24)] hover:shadow-[0_12px_32px_rgba(26,86,219,0.35)] flex items-center gap-2">
          <span className="text-lg leading-none">+</span> New Invoice
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-black text-slate-900">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <p className="text-[0.65rem] font-bold text-emerald-500 uppercase tracking-wider mb-1">Paid</p>
          <p className="text-2xl font-black text-slate-900">{revenueMtd.toLocaleString()} <span className="text-sm font-bold text-slate-400">{currency}</span></p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <p className="text-[0.65rem] font-bold text-blue-500 uppercase tracking-wider mb-1">Outstanding</p>
          <p className="text-2xl font-black text-slate-900">{totalOutstanding.toLocaleString()} <span className="text-sm font-bold text-slate-400">{currency}</span></p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <p className="text-[0.65rem] font-bold text-amber-500 uppercase tracking-wider mb-1">Overdue</p>
          <p className="text-2xl font-black text-slate-900">{statusCounts.overdue}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 mb-6 px-2">
         {tabs.map(tab => (
            <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab ? "text-primary" : "text-slate-500 hover:text-slate-800"}`}
            >
                {tab}
                {tab !== "All Invoices" && <span className="ml-1.5 text-[0.6rem] font-bold text-slate-400">{statusCounts[tab.toLowerCase()] || 0}</span>}
                {activeTab === tab && <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
         ))}
      </div>

      {/* Table */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 mx-auto">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-2">No {activeTab !== "All Invoices" ? activeTab.toLowerCase() : ""} invoices found.</p>
          <Link to="/invoices/new" className="text-primary font-bold text-sm hover:underline">Create your first invoice →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden mb-8">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-slate-100 text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6 font-semibold">Invoice</th>
                  <th className="py-4 px-6 font-semibold">Amount</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold">Due Date</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {displayed.map((invoice, index) => (
                  <motion.tr 
                     key={invoice.id}
                     className="interactive group"
                     initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                     animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                     transition={{ delay: reduceMotion ? 0 : index * 0.03, duration: 0.2 }}
                  >
                     <td className="py-5 px-6">
                        <Link to={`/invoices/${invoice.id}`} className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                           {invoice.invoice_number}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">{invoice.issue_date}</p>
                     </td>
                     <td className="py-5 px-6 font-bold text-slate-900 text-[0.9rem]">
                        {(invoice.total || 0).toLocaleString()} {currency}
                     </td>
                     <td className="py-5 px-6">
                        <Badge status={invoice.status} />
                     </td>
                     <td className="py-5 px-6 text-sm text-slate-600">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : <span className="italic text-slate-400 text-xs">Not set</span>}
                     </td>
                     <td className="py-5 px-6 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             className="text-xs font-bold text-slate-500 hover:text-primary transition-colors px-2 py-1 rounded" 
                             onClick={() => downloadPdf(invoice.id, invoice.invoice_number)}
                           >
                             PDF
                           </button>

                           {invoice.status === "draft" && (
                             <button 
                               className="text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg disabled:opacity-50" 
                               onClick={() => handleAction(invoice.id, () => sendInvoiceApi(invoice.id))}
                               disabled={actionLoading === invoice.id}
                             >
                               {actionLoading === invoice.id ? "..." : "Send"}
                             </button>
                           )}

                           {(invoice.status === "sent" || invoice.status === "overdue") && (
                             <button 
                               className="text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors px-3 py-1.5 rounded-lg disabled:opacity-50" 
                               onClick={() => handleAction(invoice.id, () => updateInvoiceStatusApi(invoice.id, "paid"))}
                               disabled={actionLoading === invoice.id}
                             >
                               {actionLoading === invoice.id ? "..." : "Mark Paid"}
                             </button>
                           )}

                           {invoice.status === "sent" && (
                             <button 
                               className="text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors px-3 py-1.5 rounded-lg disabled:opacity-50" 
                               onClick={() => handleAction(invoice.id, () => updateInvoiceStatusApi(invoice.id, "overdue"))}
                               disabled={actionLoading === invoice.id}
                             >
                               Overdue
                             </button>
                           )}
                         </div>
                     </td>
                  </motion.tr>
               ))}
            </tbody>
         </table>
         <div className="border-t border-slate-100 p-5 px-6 flex items-center justify-between text-[0.8rem] text-slate-500 bg-slate-50/30">
            <span>Showing <strong className="text-slate-900">{displayed.length}</strong> of <strong className="text-slate-900">{invoices.length}</strong> invoices</span>
         </div>
        </div>
      )}
    </motion.div>
  );
}
