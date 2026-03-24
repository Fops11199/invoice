import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { downloadInvoicePdfApi, getInvoiceApi, sendInvoiceApi, updateInvoiceStatusApi } from "../api/invoices";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const reduceMotion = useReducedMotion();

  const load = async () => {
    const { data } = await getInvoiceApi(id);
    setInvoice(data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const download = async () => {
    const { data } = await downloadInvoicePdfApi(id);
    const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice?.invoice_number || "invoice"}.pdf`;
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
      <h1 className="text-2xl font-bold">Invoice {invoice?.invoice_number || id}</h1>
      <p className="mt-2">Status: {invoice?.status}</p>
      <div className="mt-4 flex gap-3">
        <button className="interactive rounded-full border px-4 py-2" onClick={download}>Download PDF</button>
        <button className="interactive rounded-full border px-4 py-2" onClick={async () => { await sendInvoiceApi(id); await load(); }}>Send Invoice</button>
        <button className="interactive rounded-full border px-4 py-2" onClick={async () => { await updateInvoiceStatusApi(id, "paid"); await load(); }}>Mark Paid</button>
      </div>
    </motion.div>
  );
}
