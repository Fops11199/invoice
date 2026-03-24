import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { createInvoiceApi } from "../api/invoices";

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [payload, setPayload] = useState({
    client_id: "",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: new Date().toISOString().slice(0, 10),
    tax_rate: 0,
    items: [{ description: "", quantity: 1, unit_price: 0 }],
  });

  const submit = async () => {
    const { data } = await createInvoiceApi(payload);
    navigate(`/invoices/${data.id}`);
  };

  return (
    <motion.div
      className="p-6"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-2xl font-bold">Create Invoice</h1>
      <p className="mt-2">Step {step} of 4</p>
      <div className="mt-4 max-w-xl space-y-2">
        <input
          className="w-full rounded-xl border border-slate-300 p-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
          placeholder="Client ID"
          value={payload.client_id}
          onChange={(e) => setPayload({ ...payload, client_id: e.target.value })}
        />
        <input
          className="w-full rounded-xl border border-slate-300 p-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
          placeholder="Item description"
          value={payload.items[0].description}
          onChange={(e) =>
            setPayload({ ...payload, items: [{ ...payload.items[0], description: e.target.value }] })
          }
        />
      </div>
      <div className="mt-4 flex gap-2">
        <button className="interactive rounded-full border px-4 py-2" onClick={() => setStep(Math.max(1, step - 1))}>
          Back
        </button>
        {step < 4 ? (
          <button className="interactive rounded-full bg-primary px-4 py-2 text-white" onClick={() => setStep(Math.min(4, step + 1))}>
            Next
          </button>
        ) : (
          <button className="interactive rounded-full bg-primary px-4 py-2 text-white" onClick={submit}>
            Save Invoice
          </button>
        )}
      </div>
    </motion.div>
  );
}
