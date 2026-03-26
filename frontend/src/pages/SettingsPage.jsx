import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { updateProfileApi, uploadLogoApi, getPaymentMethodsApi, createPaymentMethodApi, deletePaymentMethodApi, setDefaultPaymentMethodApi } from "../api/settings";

export default function SettingsPage() {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const [profile, setProfile] = useState({
    full_name: "", business_name: "", business_address: "", phone: "", currency: "XAF", invoice_prefix: "INV-", default_notes: ""
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newPm, setNewPm] = useState({ type: "bank", label: "", account_name: "", account_number: "" });
  const [showPmForm, setShowPmForm] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || "",
        business_name: user.business_name || "",
        business_address: user.business_address || "",
        phone: user.phone || "",
        currency: user.currency || "XAF",
        invoice_prefix: user.invoice_prefix || "INV-",
        default_notes: user.default_notes || "",
      });
    }
    loadPaymentMethods();
  }, [user]);

  const loadPaymentMethods = async () => {
    try {
      const { data } = await getPaymentMethodsApi();
      setPaymentMethods(data);
    } catch {}
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg("");
    try {
      await updateProfileApi(profile);
      setProfileMsg("Profile saved successfully!");
    } catch {
      setProfileMsg("Failed to save profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const uploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      await uploadLogoApi(file);
    } catch {
      alert("Logo upload failed.");
    } finally {
      setLogoUploading(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!newPm.label || !newPm.account_number) return;
    try {
      await createPaymentMethodApi(newPm);
      setNewPm({ type: "bank", label: "", account_name: "", account_number: "" });
      setShowPmForm(false);
      loadPaymentMethods();
    } catch {
      alert("Failed to add payment method.");
    }
  };

  const removePm = async (id) => {
    if (!window.confirm("Remove this payment method?")) return;
    try {
      await deletePaymentMethodApi(id);
      loadPaymentMethods();
    } catch {
      alert("Failed to remove payment method.");
    }
  };

  const setDefaultPm = async (id) => {
    try {
      await setDefaultPaymentMethodApi(id);
      loadPaymentMethods();
    } catch {
      alert("Failed to set default.");
    }
  };

  return (
    <motion.div
      className="p-6 max-w-3xl mx-auto"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-3xl font-bold text-slate-900 mb-1">Settings</h1>
      <p className="text-slate-500 text-sm mb-8">Manage your business profile and payment preferences.</p>

      {/* Business Profile */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Business Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Full Name", key: "full_name", placeholder: "John Doe" },
            { label: "Business Name", key: "business_name", placeholder: "Studio Name" },
            { label: "Phone", key: "phone", placeholder: "+1 555 555 5555" },
            { label: "Invoice Prefix", key: "invoice_prefix", placeholder: "INV-" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{label}</label>
              <input
                className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50"
                value={profile[key]}
                onChange={e => setProfile({ ...profile, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Business Address</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50"
              value={profile.business_address}
              onChange={e => setProfile({ ...profile, business_address: e.target.value })}
              placeholder="123 Main Street, City"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Currency</label>
            <select
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50"
              value={profile.currency}
              onChange={e => setProfile({ ...profile, currency: e.target.value })}
            >
              {["XAF", "NGN", "GHS", "USD", "EUR", "GBP"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Business Logo</label>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm text-slate-600 hover:border-primary hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {logoUploading ? "Uploading..." : "Upload Logo"}
              <input type="file" className="hidden" accept="image/*" onChange={uploadLogo} />
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Default Invoice Notes</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50"
              value={profile.default_notes}
              onChange={e => setProfile({ ...profile, default_notes: e.target.value })}
              placeholder="Thank you for your business!"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          {profileMsg && <p className={`text-sm font-medium ${profileMsg.includes("success") ? "text-emerald-600" : "text-red-600"}`}>{profileMsg}</p>}
          <button
            onClick={saveProfile}
            disabled={profileSaving}
            className="interactive ml-auto rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,86,219,0.24)] hover:opacity-90 disabled:opacity-50"
          >
            {profileSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Payment Methods</h2>
          <button
            onClick={() => setShowPmForm(!showPmForm)}
            className="text-sm font-bold text-primary hover:underline"
          >
            {showPmForm ? "Cancel" : "+ Add Method"}
          </button>
        </div>

        {showPmForm && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Type</label>
                <select
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-primary bg-white"
                  value={newPm.type}
                  onChange={e => setNewPm({ ...newPm, type: e.target.value })}
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Label</label>
                <input className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-primary bg-white" value={newPm.label} onChange={e => setNewPm({ ...newPm, label: e.target.value })} placeholder="e.g. GTBank NGN" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Account Name</label>
                <input className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-primary bg-white" value={newPm.account_name} onChange={e => setNewPm({ ...newPm, account_name: e.target.value })} placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Account Number / ID</label>
                <input className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-primary bg-white" value={newPm.account_number} onChange={e => setNewPm({ ...newPm, account_number: e.target.value })} placeholder="0123456789" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={addPaymentMethod} disabled={!newPm.label || !newPm.account_number} className="rounded-full bg-primary text-white px-5 py-2 text-sm font-bold disabled:opacity-50">Save Method</button>
            </div>
          </div>
        )}

        {paymentMethods.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No payment methods yet. Add one above to include it in your invoices.</p>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map(pm => (
              <div key={pm.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{pm.label}</p>
                    {pm.is_default && <span className="text-[0.6rem] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 uppercase tracking-wider">Default</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{pm.account_name} · {pm.account_number}</p>
                </div>
                <div className="flex gap-2">
                  {!pm.is_default && (
                    <button onClick={() => setDefaultPm(pm.id)} className="text-xs font-medium text-slate-500 hover:text-primary transition-colors">Set Default</button>
                  )}
                  <button onClick={() => removePm(pm.id)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
