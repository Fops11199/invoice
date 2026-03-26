import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getClientApi, updateClientApi, deleteClientApi } from "../api/clients";

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [client, setClient] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const { data } = await getClientApi(id);
      setClient(data);
      setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "", address: data.address || "" });
    } catch {
      navigate("/clients");
    }
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await updateClientApi(id, form);
      setClient(data);
      setEditing(false);
    } catch {
      alert("Failed to update client.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${client?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteClientApi(id);
      navigate("/clients");
    } catch {
      alert("Failed to delete client.");
      setDeleting(false);
    }
  };

  if (!client) return <div className="p-10 text-center font-medium text-slate-500">Loading client...</div>;

  return (
    <motion.div
      className="p-6 max-w-3xl mx-auto"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1">← Back</button>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {client.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
            <p className="text-slate-500 text-sm">{client.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="interactive rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={remove}
            disabled={deleting}
            className="interactive rounded-full border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Client Details</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Name</label>
              <input
                className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Phone</label>
              <input
                className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Address</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={save}
                disabled={saving || !form.name}
                className="interactive rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,86,219,0.24)] hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Name", value: client.name },
              { label: "Email", value: client.email },
              { label: "Phone", value: client.phone || "—" },
              { label: "Address", value: client.address || "—" },
              { label: "Added", value: client.created_at ? new Date(client.created_at).toLocaleDateString() : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="font-medium text-slate-800 whitespace-pre-wrap">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
