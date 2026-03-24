import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { createClientApi } from "../api/clients";
import { useClients } from "../context/ClientContext";

export default function ClientsPage() {
  const { clients, refreshClients } = useClients();
  const [name, setName] = useState("");
  const reduceMotion = useReducedMotion();

  const addClient = async () => {
    if (!name) return;
    await createClientApi({ name });
    setName("");
    await refreshClients();
  };

  return (
    <motion.div
      className="p-6"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="mb-4 text-2xl font-bold">Clients</h1>
      <div className="mb-4 flex gap-2">
        <input
          className="w-full max-w-sm rounded-xl border border-slate-300 p-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client name"
        />
        <button className="interactive rounded-full bg-primary px-4 py-2 text-white" onClick={addClient}>
          Add Client
        </button>
      </div>
      {clients.map((client, index) => (
        <motion.div
          className="interactive-card mb-2 rounded-xl border border-slate-200 bg-white p-3"
          key={client.id}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : index * 0.03, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {client.name}
        </motion.div>
      ))}
    </motion.div>
  );
}
