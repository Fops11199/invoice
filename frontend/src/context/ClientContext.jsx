import { createContext, useContext, useEffect, useState } from "react";
import { listClientsApi } from "../api/clients";

const ClientContext = createContext(null);

export function ClientProvider({ children }) {
  const [clients, setClients] = useState([]);

  const refreshClients = async () => {
    const { data } = await listClientsApi();
    setClients(data);
  };

  useEffect(() => {
    refreshClients();
  }, []);

  return <ClientContext.Provider value={{ clients, refreshClients }}>{children}</ClientContext.Provider>;
}

export function useClients() {
  return useContext(ClientContext);
}
