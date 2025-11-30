import { useState, useEffect, useRef } from "react";
import { Save, Printer, Download, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Invoice, InvoiceStatus } from "@shared/schema";
import { BusinessInfoForm } from "./business-info-form";
import { ClientInfoForm } from "./client-info-form";
import { LineItemsTable } from "./line-items-table";
import { InvoiceSummary } from "./invoice-summary";
import { InvoicePreview } from "./invoice-preview";
import { StatusBadge } from "./status-badge";
import { useInvoice } from "@/lib/invoice-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InvoiceFormProps {
  invoice: Invoice;
  onSave: (invoice: Invoice) => void;
  onClose?: () => void;
}

export function InvoiceForm({ invoice: initialInvoice, onSave, onClose }: InvoiceFormProps) {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [showPreview, setShowPreview] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(true);
  const [clientOpen, setClientOpen] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const { businessInfo, updateBusinessInfo } = useInvoice();
  const { toast } = useToast();

  useEffect(() => {
    setInvoice(initialInvoice);
  }, [initialInvoice]);

  const updateField = <K extends keyof Invoice>(field: K, value: Invoice[K]) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!invoice.client.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a client name.",
        variant: "destructive",
      });
      return;
    }

    if (invoice.lineItems.some((item) => !item.description)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all item descriptions.",
        variant: "destructive",
      });
      return;
    }

    onSave(invoice);
    updateBusinessInfo(invoice.businessInfo);
    toast({
      title: "Invoice Saved",
      description: `Invoice ${invoice.invoiceNumber} has been saved.`,
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print Error",
        description: "Could not open print window. Please allow popups.",
        variant: "destructive",
      });
      return;
    }

    const previewContent = previewRef.current?.innerHTML || "";
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; color: #111827; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f9fafb; font-weight: 500; font-size: 14px; color: #6b7280; }
            td { font-size: 14px; }
            .text-right { text-align: right; }
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 12px; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-900 { color: #111827; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-8 { margin-bottom: 32px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .ml-2 { margin-left: 8px; }
            .p-8 { padding: 32px; }
            .pt-6 { padding-top: 24px; }
            .gap-4 { gap: 16px; }
            .gap-6 { gap: 24px; }
            .gap-8 { gap: 32px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-4 > * + * { margin-top: 16px; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-start { align-items: flex-start; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .border { border: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .rounded-lg { border-radius: 8px; }
            .overflow-hidden { overflow: hidden; }
            .whitespace-pre-line { white-space: pre-line; }
            .uppercase { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.025em; }
            .w-full { width: 100%; }
            .max-w-xs { max-width: 320px; }
            .ml-auto { margin-left: auto; }
            img { max-height: 64px; max-width: 64px; object-fit: contain; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              @page { margin: 1cm; size: A4; }
            }
          </style>
        </head>
        <body>
          ${previewContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = previewRef.current;
      
      if (!element) {
        toast({
          title: "Export Error",
          description: "Could not generate PDF. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${invoice.invoiceNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      html2pdf().set(opt).from(element).save();
      
      toast({
        title: "PDF Downloaded",
        description: `${invoice.invoiceNumber}.pdf has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Could not generate PDF. Please try printing instead.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div
        className={cn(
          "flex-1 overflow-y-auto p-4 transition-all duration-300 lg:p-6",
          showPreview ? "lg:w-1/2" : "lg:w-full"
        )}
      >
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" data-testid="text-invoice-number">
                {invoice.invoiceNumber}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-1.5"
                data-testid="button-toggle-preview"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Hide Preview</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5"
                data-testid="button-print"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="gap-1.5"
                data-testid="button-download-pdf"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-1.5"
                data-testid="button-save-invoice"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid w-full gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="issueDate" className="mb-2 block">
                      Issue Date
                    </Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={invoice.issueDate}
                      onChange={(e) => updateField("issueDate", e.target.value)}
                      data-testid="input-issue-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="mb-2 block">
                      Due Date
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => updateField("dueDate", e.target.value)}
                      data-testid="input-due-date"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="status" className="mb-2 block">
                    Status
                  </Label>
                  <Select
                    value={invoice.status}
                    onValueChange={(value: InvoiceStatus) => updateField("status", value)}
                  >
                    <SelectTrigger id="status" data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="referenceNumber" className="mb-2 block">
                    Reference / PO Number
                  </Label>
                  <Input
                    id="referenceNumber"
                    value={invoice.referenceNumber || ""}
                    onChange={(e) => updateField("referenceNumber", e.target.value)}
                    placeholder="Optional"
                    data-testid="input-reference-number"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Collapsible open={businessOpen} onOpenChange={setBusinessOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Your Business</CardTitle>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        businessOpen && "rotate-180"
                      )}
                    />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <BusinessInfoForm
                    businessInfo={invoice.businessInfo}
                    onChange={(info) => updateField("businessInfo", info)}
                    compact
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={clientOpen} onOpenChange={setClientOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Bill To</CardTitle>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        clientOpen && "rotate-180"
                      )}
                    />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <ClientInfoForm
                    client={invoice.client}
                    onChange={(client) => updateField("client", client)}
                    compact
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <LineItemsTable
                lineItems={invoice.lineItems}
                onChange={(items) => updateField("lineItems", items)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <InvoiceSummary
                lineItems={invoice.lineItems}
                discountAmount={invoice.discountAmount}
                onDiscountChange={(amount) => updateField("discountAmount", amount)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms" className="mb-2 block">
                  Payment Terms
                </Label>
                <Textarea
                  id="paymentTerms"
                  value={invoice.paymentTerms || ""}
                  onChange={(e) => updateField("paymentTerms", e.target.value)}
                  placeholder="Payment due within 30 days..."
                  className="min-h-[60px] resize-none"
                  data-testid="input-payment-terms"
                />
              </div>
              <div>
                <Label htmlFor="notes" className="mb-2 block">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={invoice.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Thank you for your business..."
                  className="min-h-[80px] resize-none"
                  data-testid="input-notes"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pb-8">
            {onClose && (
              <Button variant="outline" onClick={onClose} data-testid="button-cancel">
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} className="gap-1.5" data-testid="button-save-final">
              <Save className="h-4 w-4" />
              Save Invoice
            </Button>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="hidden flex-1 overflow-y-auto border-l bg-muted/30 p-6 lg:block">
          <div className="sticky top-0">
            <h2 className="mb-4 text-lg font-semibold">Live Preview</h2>
            <div className="overflow-hidden rounded-lg border shadow-lg">
              <InvoicePreview ref={previewRef} invoice={invoice} />
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        <InvoicePreview ref={previewRef} invoice={invoice} />
      </div>
    </div>
  );
}
