import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { createClientApi, deleteClientApi } from "../api/clients";
import { useClients } from "../context/ClientContext";
import { useAuth } from "../context/AuthContext";

export default function ClientsPage() {
  const { clients, refreshClients } = useClients();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const reduceMotion = useReducedMotion();
  const [search, setSearch] = useState("");

  const currency = user?.currency || "XAF";

  const addClient = async () => {
    if (!name) return;
    await createClientApi({ name, email, phone, address });
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setShowAddModal(false);
    await refreshClients();
  };

  const removeClient = async (e, id, clientName) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${clientName}"? This cannot be undone.`)) return;
    try {
      await deleteClientApi(id);
      await refreshClients();
    } catch {
      alert("Failed to delete client.");
    }
  };

  const filtered = search
    ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.email && c.email.toLowerCase().includes(search.toLowerCase())))
    : clients;

  return (
    <motion.div
      className="p-8 max-w-[1240px] mx-auto"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">Clients</h1>
          <p className="text-slate-500 mt-1">Manage your client directory</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-100/80 border-transparent rounded-full text-sm focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none transition-all w-56"
            />
          </div>
          <button 
             className="interactive rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,86,219,0.24)] hover:shadow-[0_12px_32px_rgba(26,86,219,0.35)] flex items-center gap-2"
             onClick={() => setShowAddModal(true)}
          >
            <span className="text-lg leading-none">+</span> New Client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
         <div className="bg-slate-50/80 rounded-[20px] p-6 border border-slate-200/40">
            <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Clients</p>
            <p className="text-3xl font-black tracking-tight text-slate-800 leading-none">{clients.length}</p>
         </div>
         <div className="bg-slate-50/80 rounded-[20px] p-6 border border-slate-200/40">
            <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mb-2">Currency</p>
            <p className="text-3xl font-black tracking-tight text-primary leading-none">{currency}</p>
         </div>
      </div>

      {/* Directory Header */}
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-800">Directory</h2>
          <span className="text-xs font-medium text-slate-500">{filtered.length} client{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filtered.map((client, index) => (
            <motion.div
               key={client.id}
               className="interactive-card relative bg-white rounded-[24px] p-6 border border-slate-200/60 shadow-sm overflow-hidden flex flex-col group cursor-pointer"
               initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
               animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
               transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: 0.2 }}
               onClick={() => navigate(`/clients/${client.id}`)}
            >
                {/* Decorative shape top right */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-bl-[100px] -z-10 group-hover:bg-blue-50/40 transition-colors"></div>

                <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {client.name.substring(0,1).toUpperCase()}
                    </div>
                    <button
                      onClick={(e) => removeClient(e, client.id, client.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                </div>

                <div className="mb-4 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{client.name}</h3>
                    <p className="text-[0.8rem] text-slate-500">{client.email || "No email"}</p>
                    {client.phone && <p className="text-[0.75rem] text-slate-400 mt-0.5">{client.phone}</p>}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                      Added {client.created_at ? new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </p>
                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
            </motion.div>
          ))}

          {/* Add New Client Card */}
          <motion.div
             className="interactive bg-slate-50/30 rounded-[24px] border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50/80 min-h-[240px]"
             initial={reduceMotion ? false : { opacity: 0 }}
             animate={reduceMotion ? { opacity: 1 } : { opacity: 1 }}
             onClick={() => setShowAddModal(true)}
          >
             <div className="w-12 h-12 bg-slate-200/70 rounded-full flex items-center justify-center text-slate-500 mb-4">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Add New Client</h3>
             <p className="text-xs text-slate-500 max-w-[180px]">Add a new client to start invoicing</p>
          </motion.div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
               <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Client</h3>
               <div className="space-y-4 mb-6">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Client Name *</label>
                       <input 
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                           value={name} onChange={e => setName(e.target.value)} placeholder="E.g. Acme Corporation" 
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                       <input 
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                           value={email} onChange={e => setEmail(e.target.value)} placeholder="accounts@acme.com" 
                       />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label>
                       <input 
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                           value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237 6XX XXX XXX" 
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address</label>
                       <input 
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                           value={address} onChange={e => setAddress(e.target.value)} placeholder="City, Country" 
                       />
                     </div>
                   </div>
               </div>
               <div className="flex gap-3 justify-end">
                   <button className="px-5 py-2.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                   <button className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-[0_8px_24px_rgba(26,86,219,0.24)] hover:shadow-md disabled:opacity-50" onClick={addClient} disabled={!name}>Save Client</button>
               </div>
           </div>
        </div>
      )}

    </motion.div>
  );
}
