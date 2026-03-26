import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { downloadInvoicePdfApi, downloadInvoiceCsvApi, getInvoiceApi, sendInvoiceApi, updateInvoiceStatusApi } from "../api/invoices";
import { Badge } from "../components/ui/Badge";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const reduceMotion = useReducedMotion();

  const load = async () => {
    try {
      const { data } = await getInvoiceApi(id);
      setInvoice(data);
    } catch {
      navigate('/invoices');
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const downloadPdf = async () => {
    setLoadingExport(true);
    try {
      const { data } = await downloadInvoicePdfApi(id);
      const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice?.invoice_number || "invoice"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoadingExport(false);
    }
  };

  const downloadCsv = async () => {
    setLoadingExport(true);
    try {
      const { data } = await downloadInvoiceCsvApi(id);
      const url = URL.createObjectURL(new Blob([data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice?.invoice_number || "invoice"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoadingExport(false);
    }
  };

  const shareWhatsApp = () => {
    const text = `Hello ${invoice?.client?.name || 'Client'},\n\nHere is your invoice *${invoice?.invoice_number}* for *${invoice?.currency || 'FCFA'} ${invoice?.total}*.\n\nDue Date: ${invoice?.due_date}\nPayment Method: ${invoice?.payment_method || 'Not specified'}\n\nPlease let us know if you have any questions. Thank you!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleAction = async (actionFn) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await actionFn();
      await load();
    } catch (err) {
      alert("Failed to perform action.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!invoice) return <div className="p-10 text-center font-bold text-slate-400">Loading invoice...</div>;

  return (
    <motion.div
      className="p-8 max-w-[1240px] mx-auto"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
         <Link to="/invoices" className="hover:text-slate-900 transition-colors">Invoices</Link>
         <span>›</span>
         <span className="text-slate-900">{invoice.invoice_number}</span>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-8 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-[2.2rem] font-bold tracking-tight text-slate-900 leading-tight">{invoice.invoice_number}</h1>
            <Badge status={invoice.status} />
          </div>
          <p className="text-slate-500 font-bold text-[1.1rem]">
            {invoice.total.toLocaleString()} {invoice.currency}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
           <div className="relative group">
              <button 
                className="interactive rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2" 
                disabled={loadingExport}
              >
                {loadingExport ? "Exporting..." : "Export As"} <span className="opacity-40 font-normal">▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                  <button onClick={downloadPdf} className="w-full text-left px-5 py-3.5 text-[0.85rem] font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50 transition-colors">
                     PDF Document <span className="text-[0.65rem] text-slate-400 font-medium ml-1">.pdf</span>
                  </button>
                  <button onClick={downloadCsv} className="w-full text-left px-5 py-3.5 text-[0.85rem] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                     CSV Spreadsheet <span className="text-[0.65rem] text-slate-400 font-medium ml-1">.csv</span>
                  </button>
              </div>
           </div>

           <button 
            className="interactive rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-6 py-2.5 text-sm font-bold hover:bg-emerald-100 flex items-center gap-2 transition-colors"
            onClick={shareWhatsApp}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.126.549 4.192 1.594 6.01L0 24l6.13-1.609a12.001 12.001 0 005.901 1.547h.005c6.645 0 12.031-5.385 12.031-12.031C24.068 5.385 18.682 0 12.031 0zM12.031 21.933a9.98 9.98 0 01-5.097-1.388l-.365-.217-3.793.995.996-3.793-.217-.365A9.972 9.972 0 012.062 12.03 9.976 9.976 0 0112.031 2.064c5.5 0 9.975 4.475 9.975 9.975s-4.475 9.976-9.975 9.976z" /><path d="M17.472 14.39c-.273-.137-1.611-.796-1.861-.887-.25-.091-.433-.137-.615.137-.182.274-.707.887-.866 1.07-.159.182-.32.205-.593.068-.274-.137-1.152-.424-2.196-1.353-.812-.723-1.36-1.616-1.52-1.89-.16-.273-.017-.421.12-.558.125-.125.274-.32.41-.481.137-.16.182-.274.274-.456.091-.182.046-.342-.023-.481-.068-.137-.615-1.481-.843-2.029-.222-.533-.448-.461-.615-.469-.159-.008-.342-.008-.524-.008-.182 0-.478.068-.729.342-.25.274-.956.934-.956 2.278s.98 2.643 1.116 2.825c.137.182 1.926 2.937 4.665 4.118.652.28 1.16.448 1.558.573.654.205 1.25.176 1.716.107.525-.078 1.611-.658 1.838-1.294.228-.636.228-1.18.16-1.294-.068-.114-.25-.182-.524-.318z" /></svg>
            Send WhatsApp
          </button>

          {invoice.status === "draft" && (
            <button 
              className="interactive rounded-full bg-primary px-7 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,86,219,0.3)] hover:opacity-90 disabled:opacity-50 transition-all" 
              onClick={() => handleAction(() => sendInvoiceApi(id))}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Send Invoice"}
            </button>
          )}

          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <button 
              className="interactive rounded-full bg-slate-900 px-7 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-black disabled:opacity-50 transition-all" 
              onClick={() => handleAction(() => updateInvoiceStatusApi(id, "paid"))}
              disabled={actionLoading}
            >
              Mark as Paid
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm p-8 md:p-12 mb-10 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50 rounded-bl-full -z-10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Invoice To</h3>
            <div className="flex items-center gap-4 mb-4">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-serif shadow-sm ${['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-indigo-100 text-indigo-700', 'bg-rose-100 text-rose-700'][invoice.client_id % 5]}`}>
                  {invoice.client?.name ? invoice.client.name.substring(0,2).toUpperCase() : "CL"}
               </div>
               <div>
                  <p className="font-black text-slate-900 text-[1.2rem] leading-tight mb-1">{invoice.client?.name}</p>
                  <p className="text-[0.9rem] font-bold text-primary">{invoice.client?.email}</p>
               </div>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xs">{invoice.client?.address || 'Client Studio Address, \nStreet Name, Nairobi, KE'}</p>
          </div>
          
          <div className="md:text-right flex flex-col md:items-end justify-center">
            <div className="space-y-4">
               <div>
                  <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Issue Date</p>
                  <p className="font-bold text-slate-800 text-[1rem]">{new Date(invoice.issue_date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}</p>
               </div>
               <div>
                  <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Due Date</p>
                  <p className="font-bold text-rose-600 text-[1.1rem]">{new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-8 md:-mx-12 px-8 md:px-12 mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em]">
                <th className="py-5 pr-4">Description</th>
                <th className="py-5 px-4 text-center">Qty</th>
                <th className="py-5 px-4 text-right">Rate</th>
                <th className="py-5 pl-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="group">
                  <td className="py-6 pr-4">
                      <p className="font-bold text-slate-900 text-[0.95rem]">{item.description}</p>
                      <p className="text-xs text-slate-400 mt-1">Creative Production Service</p>
                  </td>
                  <td className="py-6 px-4 text-center font-bold text-slate-700 text-[0.9rem]">{item.quantity}</td>
                  <td className="py-6 px-4 text-right font-bold text-slate-700 text-[0.9rem]">{item.unit_price.toLocaleString()}</td>
                  <td className="py-6 pl-4 text-right font-black text-slate-900 text-[1rem]">{(item.quantity * item.unit_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="flex-1 max-w-sm">
            <h4 className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Payment & Notes</h4>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
               <div className="flex items-center gap-3 mb-4 last:mb-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-bold text-slate-400 uppercase block leading-none mb-1">Method</span>
                    <span className="text-sm font-bold text-slate-700">{invoice.payment_method || "Bank Transfer / M-Pesa"}</span>
                  </div>
               </div>
               {invoice.notes && (
                  <div className="mt-5 pt-5 border-t border-slate-200/50">
                     <span className="text-[0.7rem] font-bold text-slate-400 uppercase block mb-2 tracking-wider">Notes</span>
                     <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{invoice.notes}"</p>
                  </div>
               )}
            </div>
          </div>
          
          <div className="w-full lg:w-80 space-y-4">
             <div className="flex justify-between items-center text-sm font-bold px-2">
                <span className="text-slate-400 uppercase tracking-widest text-[0.65rem]">Subtotal</span>
                <span className="text-slate-900">{invoice.subtotal?.toLocaleString() || (invoice.total / (1 + invoice.tax_rate/100)).toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-sm font-bold px-2">
                <span className="text-slate-400 uppercase tracking-widest text-[0.65rem]">Tax ({invoice.tax_rate}%)</span>
                <span className="text-slate-900">{invoice.tax_amount?.toLocaleString()}</span>
             </div>
             <div className="bg-[#1c2434] rounded-2xl p-6 text-white shadow-xl flex justify-between items-center relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                <div>
                   <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Amount Due</p>
                   <p className="text-2xl font-black tracking-tight">{invoice.total.toLocaleString()} <span className="text-xs font-bold text-slate-500 uppercase ml-1">XAF</span></p>
                </div>
                {invoice.status !== 'paid' && (
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center flex-col items-center gap-4 py-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Questions regarding this invoice?</p>
          <button className="text-primary font-bold text-sm hover:underline">Support & Billing Help</button>
      </div>

    </motion.div>
  );
}
