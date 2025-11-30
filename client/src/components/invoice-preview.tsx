import type { Invoice } from "@shared/schema";
import { StatusBadge } from "./status-badge";
import { LineItemsTable } from "./line-items-table";
import { InvoiceSummary } from "./invoice-summary";
import { formatDate } from "@/lib/invoice-utils";
import { forwardRef } from "react";

interface InvoicePreviewProps {
  invoice: Invoice;
  className?: string;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoice, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white text-gray-900 ${className || ""}`}
        id="invoice-preview"
        data-testid="invoice-preview"
      >
        <div className="p-8 print:p-0">
          <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              {invoice.businessInfo.logo && (
                <img
                  src={invoice.businessInfo.logo}
                  alt="Business logo"
                  className="h-16 w-16 object-contain"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {invoice.businessInfo.name || "Your Business"}
                </h2>
                {invoice.businessInfo.email && (
                  <p className="text-sm text-gray-600">{invoice.businessInfo.email}</p>
                )}
                {invoice.businessInfo.phone && (
                  <p className="text-sm text-gray-600">{invoice.businessInfo.phone}</p>
                )}
                {invoice.businessInfo.address && (
                  <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                    {invoice.businessInfo.address}
                  </p>
                )}
                {invoice.businessInfo.taxId && (
                  <p className="mt-1 text-sm text-gray-600">
                    Tax ID: {invoice.businessInfo.taxId}
                  </p>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="mt-1 text-lg font-semibold text-primary">
                {invoice.invoiceNumber}
              </p>
              <div className="mt-2">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          <div className="mb-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Bill To
              </h3>
              <p className="font-semibold text-gray-900">
                {invoice.client.name || "Client Name"}
              </p>
              {invoice.client.email && (
                <p className="text-sm text-gray-600">{invoice.client.email}</p>
              )}
              {invoice.client.phone && (
                <p className="text-sm text-gray-600">{invoice.client.phone}</p>
              )}
              {invoice.client.address && (
                <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                  {invoice.client.address}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:text-right">
              <div>
                <span className="text-sm text-gray-500">Issue Date:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatDate(invoice.issueDate)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Due Date:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              {invoice.referenceNumber && (
                <div>
                  <span className="text-sm text-gray-500">Reference:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {invoice.referenceNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
            <LineItemsTable lineItems={invoice.lineItems} onChange={() => {}} readonly />
          </div>

          <div className="mb-8 flex justify-end">
            <InvoiceSummary
              lineItems={invoice.lineItems}
              discountAmount={invoice.discountAmount}
              readonly
            />
          </div>

          {(invoice.notes || invoice.paymentTerms) && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              {invoice.paymentTerms && (
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-700">
                    Payment Terms
                  </h3>
                  <p className="text-sm text-gray-600">{invoice.paymentTerms}</p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-700">Notes</h3>
                  <p className="whitespace-pre-line text-sm text-gray-600">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
