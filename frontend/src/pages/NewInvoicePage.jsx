import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { createInvoiceApi } from "../api/invoices";
import { useClients } from "../context/ClientContext";
import { useAuth } from "../context/AuthContext";

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  
  const { clients } = useClients();
  const { user } = useAuth();
  const currency = user?.currency || "XAF";
  const [step, setStep] = useState(3); // Setting default to 1 later, using 3 for preview match but let's use 1
  const [loading, setLoading] = useState(false);

  // Initialize step to 1
  useState(() => { setStep(1); }, []);

  const [payload, setPayload] = useState({
    client_id: "",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: new Date().toISOString().slice(0, 10),
    tax_rate: 5,
    payment_method: "",
    notes: "",
    terms: "Payment due within 15 days...",
    items: [{ description: "Brand Identity Design - Phase 1", quantity: 1, unit_price: 1200 }],
  });

  const handleNext = () => setStep(Math.min(4, step + 1));
  const handleBack = () => setStep(Math.max(1, step - 1));

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await createInvoiceApi(payload);
      navigate(`/invoices/${data.id}`);
    } catch (err) {
      console.error("Failed to create invoice", err);
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...payload.items];
    let parsedValue = value;
    if (field === "quantity" || field === "unit_price") {
        parsedValue = parseFloat(value) || 0;
    }
    newItems[index] = { ...newItems[index], [field]: parsedValue };
    if ((field === "quantity" || field === "unit_price") && value === "") {
        newItems[index] = { ...newItems[index], [field]: value };
    }
    setPayload({ ...payload, items: newItems });
  };

  const addItem = () => {
    setPayload({
      ...payload,
      items: [...payload.items, { description: "", quantity: 1, unit_price: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = payload.items.filter((_, i) => i !== index);
    setPayload({ ...payload, items: newItems });
  };

  const calculateSubtotal = () => {
    return payload.items.reduce((sum, item) => {
        const q = parseFloat(item.quantity) || 0;
        const p = parseFloat(item.unit_price) || 0;
        return sum + (q * p);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * (payload.tax_rate / 100);
  const total = subtotal + tax;

  const steps = ["Client", "Details", "Line Items", "Review"];
  const selectedClient = clients.find(c => c.id.toString() === payload.client_id.toString());

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
         <span className="text-slate-900">New Invoice</span>
      </div>
      
      <div className="mb-10 flex items-center justify-between">
         <h1 className="text-[2rem] font-bold tracking-tight text-slate-900">Drafting New Invoice</h1>
         <div className="flex gap-3">
             <button className="interactive rounded-full border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100">
               Save Draft
             </button>
             <button className="interactive rounded-full bg-primary px-6 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,86,219,0.24)] hover:shadow-[0_12px_32px_rgba(26,86,219,0.35)]" onClick={handleNext}>
               Continue
             </button>
         </div>
      </div>

      {/* Stepper */}
      <div className="mb-10 w-full max-w-4xl">
          <div className="relative flex items-center justify-between">
             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full"></div>
             <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
             ></div>
             
             {steps.map((s, i) => {
                 const stepNum = i + 1;
                 const isActive = step === stepNum;
                 const isCompleted = step > stepNum;
                 return (
                     <div key={s} className="relative flex flex-col items-center gap-2">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-[#f8fafc] z-10 transition-colors ${isActive || isCompleted ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                             {isCompleted ? (
                                 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                             ) : (
                                 stepNum
                             )}
                         </div>
                         <span className={`absolute top-12 text-xs font-bold whitespace-nowrap transition-colors ${isActive || isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                             {s}
                         </span>
                     </div>
                 );
             })}
          </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8 mt-16">
          {/* Left Column (Dynamic Step Content) */}
          <div className="flex-1">
             <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-8 min-h-[400px]">
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-bold mb-4">Select Client</h2>
                    {!clients.length ? (
                        <div className="text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200">
                            You have no clients. Please <button onClick={() => navigate("/clients")} className="underline font-bold">add a client</button> first.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {clients.map(c => (
                                <div 
                                   key={c.id} 
                                   onClick={() => setPayload({ ...payload, client_id: c.id })}
                                   className={`interactive p-4 border rounded-2xl cursor-pointer transition-colors ${payload.client_id === c.id ? 'border-primary ring-1 ring-primary bg-blue-50/30' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                >
                                   <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold font-serif shrink-0 ${payload.client_id === c.id ? 'bg-primary text-white' : ''}`}>
                                        {c.name.substring(0,2).toUpperCase()}
                                      </div>
                                      <div>
                                          <p className="font-bold text-slate-900">{c.name}</p>
                                          <p className="text-xs text-slate-500">{c.email}</p>
                                      </div>
                                   </div>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-bold mb-4">Invoice Details</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Date</label>
                        <input
                          type="date"
                          className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                          value={payload.issue_date}
                          onChange={(e) => setPayload({ ...payload, issue_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                        <input
                          type="date"
                          className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                          value={payload.due_date}
                          onChange={(e) => setPayload({ ...payload, due_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tax Rate (%)</label>
                            <input
                              type="number"
                              step="1"
                              className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                              value={payload.tax_rate}
                              onChange={(e) => setPayload({ ...payload, tax_rate: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Method</label>
                             <input
                              type="text"
                              className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                              placeholder="e.g. Bank Transfer"
                              value={payload.payment_method}
                              onChange={(e) => setPayload({ ...payload, payment_method: e.target.value })}
                             />
                        </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-2">
                       <div>
                          <h2 className="text-[1.35rem] font-bold text-slate-900 leading-tight">Invoice Items</h2>
                          <p className="text-sm text-slate-500 mt-1">Detail the creative services provided</p>
                       </div>
                       <button className="text-primary font-bold text-sm bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1.5" onClick={addItem}>
                         <span className="text-lg leading-none shrink-0">+</span> Add Item
                       </button>
                    </div>

                    <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                       <div className="col-span-6">Description</div>
                       <div className="col-span-2">Rate</div>
                       <div className="col-span-2 text-center">Qty</div>
                       <div className="col-span-2 text-right">Amount</div>
                    </div>

                    <div className="space-y-3">
                        {payload.items.map((item, idx) => (
                        <div key={idx} className="group relative flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center bg-slate-50/50 border border-slate-100 p-3 sm:p-2 sm:px-4 rounded-xl sm:rounded-2xl transition hover:border-slate-200 hover:shadow-sm">
                            <div className="col-span-6 w-full">
                            <input
                                className="w-full bg-transparent p-2 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-medium"
                                placeholder="Brand Identity Design - Phase 1"
                                value={item.description}
                                onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                            />
                            </div>
                            <div className="col-span-2 w-full flex items-center font-bold text-sm text-slate-900">
                                <span className="text-slate-400 mr-2 text-xs">FCFA</span>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full bg-transparent py-2 outline-none font-bold"
                                    value={item.unit_price}
                                    onChange={(e) => handleItemChange(idx, "unit_price", e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 w-full text-center">
                                <input
                                    type="number"
                                    min="1"
                                    className="w-12 bg-transparent text-center py-2 font-bold text-sm text-slate-900 outline-none"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 w-full text-right flex items-center justify-end gap-3 font-bold text-sm text-slate-900">
                                <div>
                                    <span className="text-slate-400 text-xs mr-1 block sm:hidden">FCFA</span>
                                    {(item.quantity * item.unit_price).toLocaleString()}
                                </div>
                                {payload.items.length > 1 && (
                                    <button 
                                        onClick={() => removeItem(idx)} 
                                        className="text-red-300 hover:text-red-500 transition-colors p-1"
                                        title="Remove item"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        ))}
                    </div>
                    
                    <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-colors" onClick={addItem}>
                        + Click to add another line item
                    </button>

                    <div className="grid sm:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes to Client</label>
                            <textarea
                            className="w-full rounded-xl border border-slate-200 p-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 resize-none h-24"
                            placeholder="Thanks for the business!"
                            value={payload.notes}
                            onChange={(e) => setPayload({ ...payload, notes: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Terms & Conditions</label>
                            <textarea
                            className="w-full rounded-xl border border-slate-200 p-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 resize-none h-24"
                            placeholder="Payment due within 15 days..."
                            value={payload.terms}
                            onChange={(e) => setPayload({ ...payload, terms: e.target.value })}
                            />
                        </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-bold mb-4">Review Invoice</h2>
                    <p className="text-slate-500 text-sm">Please review the details on the right panel before sending. Once sent, the invoice will be marked as outstanding.</p>
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200/60 flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100/50 text-amber-600 flex items-center justify-center shrink-0">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-900 mb-1">Final Confirmation</h4>
                            <p className="text-sm text-amber-800/80">Double-check the client email and the total amount. Automated follow-up sequences will begin based on the due date.</p>
                        </div>
                    </div>
                  </div>
                )}
             </div>
             
             {/* Back button logic outside the card if needed, actually let's float it here or below */}
             <div className="mt-6 flex items-center gap-4">
                {step > 1 && (
                    <button 
                        className="interactive font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2" 
                        onClick={handleBack}
                    >
                    <span>←</span> Back to previous step
                    </button>
                )}
             </div>
          </div>

          {/* Right Column (Summary Cards) */}
          <div className="w-full lg:w-[360px] flex flex-col gap-6 shrink-0">
             {/* Financial Summary */}
             <div className="bg-[#1e44a5] rounded-3xl p-8 text-white shadow-[0_20px_40px_rgba(30,68,165,0.25)] relative overflow-hidden interactive-card">
                 <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                 <h3 className="text-[0.65rem] font-bold text-blue-200 uppercase tracking-wider mb-6">Financial Summary</h3>
                 
                 <div className="space-y-4 mb-8">
                     <div className="flex justify-between text-sm font-medium items-center">
                         <span className="text-blue-200">Subtotal</span>
                         <span>{subtotal.toLocaleString()} {currency}</span>
                     </div>
                     <div className="flex justify-between text-sm font-medium items-center">
                         <span className="text-blue-200">Tax ({payload.tax_rate}%)</span>
                         <span>{tax.toLocaleString()} {currency}</span>
                     </div>
                     <div className="flex justify-between text-sm font-medium items-center">
                         <span className="text-blue-200">Discount</span>
                         <span>0 {currency}</span>
                     </div>
                 </div>

                 <div className="border-t border-blue-400/30 pt-6">
                     <p className="text-[0.65rem] font-bold text-blue-200 uppercase tracking-wider mb-2">Total Amount</p>
                     <p className="text-3xl font-black tracking-tight leading-tight text-white">{total.toLocaleString()} <span className="text-lg font-bold text-blue-200">{currency}</span></p>
                 </div>
             </div>

             {/* Recipient Card */}
             {selectedClient && (
                 <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm interactive-card">
                     <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-4">Recipient</p>
                     <div className="flex items-start gap-4 mb-5">
                          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {selectedClient.name.substring(0,1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{selectedClient.name}</p>
                              {selectedClient.address && <p className="text-xs text-slate-500 truncate mt-0.5">{selectedClient.address}</p>}
                              <p className="text-xs text-primary font-medium truncate mt-0.5">{selectedClient.email}</p>
                          </div>
                     </div>
                     <button className="w-full py-2.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200/60" onClick={() => setStep(1)}>
                         Change Client
                     </button>
                 </div>
             )}
          </div>
      </div>

    </motion.div>
  );
}
