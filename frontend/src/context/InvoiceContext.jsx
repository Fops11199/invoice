import { createContext, useContext, useEffect, useState } from "react";
import { listInvoicesApi } from "../api/invoices";

const InvoiceContext = createContext(null);

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshInvoices = async () => {
    const { data } = await listInvoicesApi();
    setInvoices(data);
  };

  useEffect(() => {
    refreshInvoices().finally(() => setLoading(false));
  }, []);

  return <InvoiceContext.Provider value={{ invoices, loading, refreshInvoices }}>{children}</InvoiceContext.Provider>;
}

export function useInvoices() {
  return useContext(InvoiceContext);
}
