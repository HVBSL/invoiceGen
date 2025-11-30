import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unitPrice: z.number().min(0, "Price must be positive"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0-100"),
});

export const clientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const businessInfoSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  logo: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  defaultPaymentTerms: z.string().optional(),
  defaultNotes: z.string().optional(),
});

export const invoiceStatusSchema = z.enum(["draft", "sent", "paid", "overdue"]);

export const invoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  status: invoiceStatusSchema,
  issueDate: z.string(),
  dueDate: z.string(),
  businessInfo: businessInfoSchema,
  client: clientSchema,
  lineItems: z.array(lineItemSchema),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  referenceNumber: z.string().optional(),
  discountAmount: z.number().min(0).default(0),
});

export type LineItem = z.infer<typeof lineItemSchema>;
export type Client = z.infer<typeof clientSchema>;
export type BusinessInfo = z.infer<typeof businessInfoSchema>;
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

export type InsertLineItem = Omit<LineItem, "id">;
export type InsertClient = Omit<Client, "id">;
export type InsertInvoice = Omit<Invoice, "id" | "invoiceNumber">;

// Users schema for compatibility
export const users = {
  id: "",
  username: "",
  password: "",
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
