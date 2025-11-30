import type { LineItem, Invoice, Client, BusinessInfo, InvoiceStatus } from "@shared/schema";
import { invoiceSchema, clientSchema, businessInfoSchema } from "@shared/schema";
import { z } from "zod";

const STORAGE_KEYS = {
  INVOICES: "invoices",
  CLIENTS: "clients",
  BUSINESS_INFO: "businessInfo",
  INVOICE_COUNTER: "invoiceCounter",
};

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateInvoiceNumber(): string {
  const counter = getInvoiceCounter();
  const newCounter = counter + 1;
  setInvoiceCounter(newCounter);
  return `INV-${String(newCounter).padStart(3, "0")}`;
}

function getInvoiceCounter(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.INVOICE_COUNTER);
  return stored ? parseInt(stored, 10) : 0;
}

function setInvoiceCounter(value: number): void {
  localStorage.setItem(STORAGE_KEYS.INVOICE_COUNTER, String(value));
}

export function calculateLineItemAmount(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

export function calculateSubtotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + calculateLineItemAmount(item), 0);
}

export function calculateTaxAmount(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => {
    const amount = calculateLineItemAmount(item);
    return sum + (amount * item.taxRate) / 100;
  }, 0);
}

export function calculateTotal(lineItems: LineItem[], discountAmount: number = 0): number {
  const subtotal = calculateSubtotal(lineItems);
  const tax = calculateTaxAmount(lineItems);
  return subtotal + tax - discountAmount;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDueDateDefault(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function sanitizeLineItem(item: unknown): LineItem {
  const defaults: LineItem = {
    id: generateId(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
  };
  
  if (!item || typeof item !== "object") return defaults;
  
  const i = item as Record<string, unknown>;
  return {
    id: typeof i.id === "string" ? i.id : defaults.id,
    description: typeof i.description === "string" ? i.description : defaults.description,
    quantity: typeof i.quantity === "number" && i.quantity >= 0 ? i.quantity : defaults.quantity,
    unitPrice: typeof i.unitPrice === "number" && i.unitPrice >= 0 ? i.unitPrice : defaults.unitPrice,
    taxRate: typeof i.taxRate === "number" && i.taxRate >= 0 && i.taxRate <= 100 ? i.taxRate : defaults.taxRate,
  };
}

function sanitizeClient(client: unknown): Client {
  const defaults = createEmptyClient();
  
  if (!client || typeof client !== "object") return defaults;
  
  const c = client as Record<string, unknown>;
  return {
    id: typeof c.id === "string" ? c.id : defaults.id,
    name: typeof c.name === "string" ? c.name : defaults.name,
    email: typeof c.email === "string" ? c.email : defaults.email,
    phone: typeof c.phone === "string" ? c.phone : defaults.phone,
    address: typeof c.address === "string" ? c.address : defaults.address,
  };
}

function sanitizeBusinessInfo(info: unknown): BusinessInfo {
  const defaults = createDefaultBusinessInfo();
  
  if (!info || typeof info !== "object") return defaults;
  
  const i = info as Record<string, unknown>;
  return {
    name: typeof i.name === "string" ? i.name : defaults.name,
    logo: typeof i.logo === "string" ? i.logo : defaults.logo,
    email: typeof i.email === "string" ? i.email : defaults.email,
    phone: typeof i.phone === "string" ? i.phone : defaults.phone,
    address: typeof i.address === "string" ? i.address : defaults.address,
    taxId: typeof i.taxId === "string" ? i.taxId : defaults.taxId,
    defaultPaymentTerms: typeof i.defaultPaymentTerms === "string" ? i.defaultPaymentTerms : defaults.defaultPaymentTerms,
    defaultNotes: typeof i.defaultNotes === "string" ? i.defaultNotes : defaults.defaultNotes,
  };
}

function sanitizeInvoice(invoice: unknown): Invoice | null {
  if (!invoice || typeof invoice !== "object") return null;
  
  const inv = invoice as Record<string, unknown>;
  
  if (typeof inv.id !== "string" || typeof inv.invoiceNumber !== "string") {
    return null;
  }
  
  const validStatuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
  const status = validStatuses.includes(inv.status as InvoiceStatus) 
    ? (inv.status as InvoiceStatus) 
    : "draft";
  
  const lineItems = Array.isArray(inv.lineItems) 
    ? inv.lineItems.map(sanitizeLineItem)
    : [createEmptyLineItem()];
  
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    status,
    issueDate: typeof inv.issueDate === "string" ? inv.issueDate : getTodayDate(),
    dueDate: typeof inv.dueDate === "string" ? inv.dueDate : getDueDateDefault(),
    businessInfo: sanitizeBusinessInfo(inv.businessInfo),
    client: sanitizeClient(inv.client),
    lineItems: lineItems.length > 0 ? lineItems : [createEmptyLineItem()],
    notes: typeof inv.notes === "string" ? inv.notes : "",
    paymentTerms: typeof inv.paymentTerms === "string" ? inv.paymentTerms : "Payment due within 30 days of invoice date.",
    referenceNumber: typeof inv.referenceNumber === "string" ? inv.referenceNumber : "",
    discountAmount: typeof inv.discountAmount === "number" && inv.discountAmount >= 0 ? inv.discountAmount : 0,
  };
}

export function saveInvoices(invoices: Invoice[]): void {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
}

export function loadInvoices(): Invoice[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    return parsed
      .map(sanitizeInvoice)
      .filter((inv): inv is Invoice => inv !== null);
  } catch {
    return [];
  }
}

export function saveClients(clients: Client[]): void {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
}

export function loadClients(): Client[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    return parsed.map(sanitizeClient);
  } catch {
    return [];
  }
}

export function saveBusinessInfo(info: BusinessInfo): void {
  localStorage.setItem(STORAGE_KEYS.BUSINESS_INFO, JSON.stringify(info));
}

export function loadBusinessInfo(): BusinessInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS_INFO);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return sanitizeBusinessInfo(parsed);
  } catch {
    return null;
  }
}

export function getStatusColor(status: InvoiceStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "draft":
      return {
        bg: "bg-secondary",
        text: "text-secondary-foreground",
        border: "border-secondary-border",
      };
    case "sent":
      return {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
      };
    case "paid":
      return {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-300",
        border: "border-green-200 dark:border-green-800",
      };
    case "overdue":
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-200 dark:border-red-800",
      };
    default:
      return {
        bg: "bg-secondary",
        text: "text-secondary-foreground",
        border: "border-secondary-border",
      };
  }
}

export function createEmptyLineItem(): LineItem {
  return {
    id: generateId(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
  };
}

export function createEmptyClient(): Client {
  return {
    id: generateId(),
    name: "",
    email: "",
    phone: "",
    address: "",
  };
}

export function createDefaultBusinessInfo(): BusinessInfo {
  return {
    name: "",
    logo: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    defaultPaymentTerms: "Payment due within 30 days of invoice date.",
    defaultNotes: "",
  };
}

export function createEmptyInvoice(businessInfo?: BusinessInfo): Invoice {
  const defaultPaymentTerms = businessInfo?.defaultPaymentTerms || "Payment due within 30 days of invoice date.";
  const defaultNotes = businessInfo?.defaultNotes || "";
  
  return {
    id: generateId(),
    invoiceNumber: generateInvoiceNumber(),
    status: "draft",
    issueDate: getTodayDate(),
    dueDate: getDueDateDefault(),
    businessInfo: businessInfo ? deepClone(businessInfo) : createDefaultBusinessInfo(),
    client: createEmptyClient(),
    lineItems: [createEmptyLineItem()],
    notes: defaultNotes,
    paymentTerms: defaultPaymentTerms,
    referenceNumber: "",
    discountAmount: 0,
  };
}

export function duplicateInvoice(invoice: Invoice): Invoice {
  const cloned = deepClone(invoice);
  return {
    ...cloned,
    id: generateId(),
    invoiceNumber: generateInvoiceNumber(),
    status: "draft",
    issueDate: getTodayDate(),
    dueDate: getDueDateDefault(),
    lineItems: cloned.lineItems.map((item) => ({
      ...item,
      id: generateId(),
    })),
  };
}

export function searchInvoices(invoices: Invoice[], query: string): Invoice[] {
  if (!query.trim()) return invoices;
  const lowerQuery = query.toLowerCase();
  return invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(lowerQuery) ||
      inv.client.name.toLowerCase().includes(lowerQuery) ||
      inv.client.email?.toLowerCase().includes(lowerQuery)
  );
}

export function filterInvoicesByStatus(
  invoices: Invoice[],
  status: InvoiceStatus | "all"
): Invoice[] {
  if (status === "all") return invoices;
  return invoices.filter((inv) => inv.status === status);
}

export function filterInvoicesByDateRange(
  invoices: Invoice[],
  startDate?: string,
  endDate?: string
): Invoice[] {
  return invoices.filter((inv) => {
    const issueDate = new Date(inv.issueDate);
    if (startDate && issueDate < new Date(startDate)) return false;
    if (endDate && issueDate > new Date(endDate)) return false;
    return true;
  });
}

export function sortInvoices(
  invoices: Invoice[],
  sortBy: "date" | "number" | "amount" = "date",
  order: "asc" | "desc" = "desc"
): Invoice[] {
  return [...invoices].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "date":
        comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        break;
      case "number":
        comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
        break;
      case "amount":
        comparison =
          calculateTotal(a.lineItems, a.discountAmount) -
          calculateTotal(b.lineItems, b.discountAmount);
        break;
    }
    return order === "desc" ? -comparison : comparison;
  });
}
