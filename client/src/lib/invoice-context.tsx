import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { Invoice, Client, BusinessInfo } from "@shared/schema";
import {
  loadInvoices,
  saveInvoices,
  loadClients,
  saveClients,
  loadBusinessInfo,
  saveBusinessInfo,
  createEmptyInvoice,
  createDefaultBusinessInfo,
  duplicateInvoice,
  generateId,
  deepClone,
} from "./invoice-utils";

interface InvoiceContextType {
  invoices: Invoice[];
  clients: Client[];
  businessInfo: BusinessInfo;
  currentInvoice: Invoice | null;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  createNewInvoice: () => Invoice;
  saveInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoiceById: (id: string) => Invoice;
  updateBusinessInfo: (info: BusinessInfo) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  getEditableInvoice: (id: string) => Invoice | undefined;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(createDefaultBusinessInfo());
  const [currentInvoice, setCurrentInvoiceState] = useState<Invoice | null>(null);

  useEffect(() => {
    const loadedInvoices = loadInvoices();
    const loadedClients = loadClients();
    const loadedBusinessInfo = loadBusinessInfo();
    
    setInvoices(loadedInvoices);
    setClients(loadedClients);
    if (loadedBusinessInfo) {
      setBusinessInfo(loadedBusinessInfo);
    }
  }, []);

  const setCurrentInvoice = useCallback((invoice: Invoice | null) => {
    setCurrentInvoiceState(invoice ? deepClone(invoice) : null);
  }, []);

  const createNewInvoice = useCallback((): Invoice => {
    const newInvoice = createEmptyInvoice(businessInfo);
    setCurrentInvoiceState(newInvoice);
    return deepClone(newInvoice);
  }, [businessInfo]);

  const saveInvoice = useCallback((invoice: Invoice) => {
    const invoiceToSave = deepClone(invoice);
    
    setInvoices((prev) => {
      const existingIndex = prev.findIndex((inv) => inv.id === invoiceToSave.id);
      let updated: Invoice[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = invoiceToSave;
      } else {
        updated = [...prev, invoiceToSave];
      }
      saveInvoices(updated);
      return updated;
    });

    if (invoiceToSave.client.name) {
      setClients((prev) => {
        const existingById = prev.find((c) => c.id === invoiceToSave.client.id);
        const existingByName = prev.find(
          (c) => c.name.toLowerCase() === invoiceToSave.client.name.toLowerCase()
        );
        
        if (!existingById && !existingByName) {
          const clientToAdd = deepClone(invoiceToSave.client);
          const updated = [...prev, clientToAdd];
          saveClients(updated);
          return updated;
        }
        return prev;
      });
    }
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => {
      const updated = prev.filter((inv) => inv.id !== id);
      saveInvoices(updated);
      return updated;
    });
    setCurrentInvoiceState((current) => {
      if (current?.id === id) return null;
      return current;
    });
  }, []);

  const duplicateInvoiceById = useCallback((id: string): Invoice => {
    const original = invoices.find((inv) => inv.id === id);
    if (!original) throw new Error("Invoice not found");
    return duplicateInvoice(original);
  }, [invoices]);

  const updateBusinessInfo = useCallback((info: BusinessInfo) => {
    const infoToSave = deepClone(info);
    setBusinessInfo(infoToSave);
    saveBusinessInfo(infoToSave);
  }, []);

  const addClient = useCallback((client: Client) => {
    const clientToAdd = deepClone(client);
    clientToAdd.id = clientToAdd.id || generateId();
    setClients((prev) => {
      const updated = [...prev, clientToAdd];
      saveClients(updated);
      return updated;
    });
  }, []);

  const updateClient = useCallback((client: Client) => {
    const clientToUpdate = deepClone(client);
    setClients((prev) => {
      const index = prev.findIndex((c) => c.id === clientToUpdate.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = clientToUpdate;
        saveClients(updated);
        return updated;
      }
      return prev;
    });
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveClients(updated);
      return updated;
    });
  }, []);

  const getInvoiceById = useCallback((id: string): Invoice | undefined => {
    const found = invoices.find((inv) => inv.id === id);
    return found ? deepClone(found) : undefined;
  }, [invoices]);

  const getEditableInvoice = useCallback((id: string): Invoice | undefined => {
    const found = invoices.find((inv) => inv.id === id);
    return found ? deepClone(found) : undefined;
  }, [invoices]);

  const contextValue = useMemo(() => ({
    invoices,
    clients,
    businessInfo,
    currentInvoice,
    setCurrentInvoice,
    createNewInvoice,
    saveInvoice,
    deleteInvoice,
    duplicateInvoiceById,
    updateBusinessInfo,
    addClient,
    updateClient,
    deleteClient,
    getInvoiceById,
    getEditableInvoice,
  }), [
    invoices,
    clients,
    businessInfo,
    currentInvoice,
    setCurrentInvoice,
    createNewInvoice,
    saveInvoice,
    deleteInvoice,
    duplicateInvoiceById,
    updateBusinessInfo,
    addClient,
    updateClient,
    deleteClient,
    getInvoiceById,
    getEditableInvoice,
  ]);

  return (
    <InvoiceContext.Provider value={contextValue}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoice must be used within an InvoiceProvider");
  }
  return context;
}
