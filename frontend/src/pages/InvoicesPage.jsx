import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useInvoices } from "../context/InvoiceContext";
import { downloadInvoicePdfApi, updateInvoiceStatusApi } from "../api/invoices";

export default function InvoicesPage() {
  const { invoices, refreshInvoices } = useInvoices();
  const reduceMotion = useReducedMotion();

  const markPaid = async (id) => {
    await updateInvoiceStatusApi(id, "paid");
    await refreshInvoices();
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

  return (
    <motion.div
      className="p-6"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link to="/invoices/new" className="interactive rounded-full bg-primary px-4 py-2 text-white shadow-[0_8px_24px_rgba(26,86,219,0.24)]">
          New Invoice
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {invoices.map((invoice, index) => (
          <motion.div
            className="interactive flex items-center gap-4 border-b p-3 last:border-b-0"
            key={invoice.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.03, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link className="font-medium" to={`/invoices/${invoice.id}`}>
              {invoice.invoice_number}
            </Link>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-700">{invoice.status}</span>
            <span className="text-sm font-medium">{invoice.total}</span>
            <button className="interactive ml-auto text-sm underline" onClick={() => downloadPdf(invoice.id, invoice.invoice_number)}>
              PDF
            </button>
            <button className="interactive text-sm underline" onClick={() => markPaid(invoice.id)}>
              Mark Paid
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
