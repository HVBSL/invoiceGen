import { useState, useMemo, useRef } from "react";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Eye,
  MoreHorizontal,
  FileText,
  Plus,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "./status-badge";
import { InvoicePreview } from "./invoice-preview";
import type { Invoice, InvoiceStatus } from "@shared/schema";
import {
  formatCurrency,
  formatShortDate,
  calculateTotal,
  searchInvoices,
  filterInvoicesByStatus,
  sortInvoices,
} from "@/lib/invoice-utils";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => Invoice;
  onPreview: (invoice: Invoice) => void;
  onNewInvoice: () => void;
}

export function InvoiceList({
  invoices,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onNewInvoice,
}: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "number" | "amount">("date");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const filteredInvoices = useMemo(() => {
    let result = searchInvoices(invoices, searchQuery);
    result = filterInvoicesByStatus(result, statusFilter);
    result = sortInvoices(result, sortBy, "desc");
    return result;
  }, [invoices, searchQuery, statusFilter, sortBy]);

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      onDelete(invoiceToDelete);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleDuplicate = (id: string) => {
    const newInvoice = onDuplicate(id);
    onEdit(newInvoice);
  };

  const handlePrint = (invoice: Invoice) => {
    setInvoiceToPrint(invoice);
    setTimeout(() => {
      if (!printRef.current) {
        toast({
          title: "Print Error",
          description: "Could not prepare invoice for printing.",
          variant: "destructive",
        });
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "Print Error",
          description: "Could not open print window. Please allow popups.",
          variant: "destructive",
        });
        return;
      }

      const previewContent = printRef.current.innerHTML;
      
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
        setInvoiceToPrint(null);
      }, 250);
    }, 100);
  };

  if (invoices.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">No invoices yet</h2>
        <p className="mb-6 max-w-sm text-muted-foreground">
          Create your first invoice to start tracking your billing and payments.
        </p>
        <Button onClick={onNewInvoice} className="gap-1.5" data-testid="button-create-first-invoice">
          <Plus className="h-4 w-4" />
          Create Your First Invoice
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-invoices"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as InvoiceStatus | "all")}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-[140px]" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
            <Search className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              No invoices found matching your search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="hidden md:block">
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, index) => (
                  <tr
                    key={invoice.id}
                    className={cn(
                      "border-b transition-colors hover-elevate cursor-pointer",
                      index % 2 === 0 ? "bg-transparent" : "bg-muted/20"
                    )}
                    onClick={() => onEdit(invoice)}
                    data-testid={`row-invoice-${invoice.id}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium" data-testid={`text-invoice-number-${invoice.id}`}>
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">{invoice.client.name || "—"}</span>
                        {invoice.client.email && (
                          <p className="text-sm text-muted-foreground">
                            {invoice.client.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatShortDate(invoice.issueDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(calculateTotal(invoice.lineItems, invoice.discountAmount))}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-actions-${invoice.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(invoice)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPreview(invoice)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrint(invoice)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(invoice.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(invoice.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-3 md:hidden">
        {filteredInvoices.map((invoice) => (
          <Card
            key={invoice.id}
            className="cursor-pointer hover-elevate"
            onClick={() => onEdit(invoice)}
            data-testid={`card-invoice-${invoice.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{invoice.invoiceNumber}</span>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <p className="mt-1 truncate font-medium">
                    {invoice.client.name || "No client"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatShortDate(invoice.issueDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold">
                    {formatCurrency(calculateTotal(invoice.lineItems, invoice.discountAmount))}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(invoice)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPreview(invoice)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrint(invoice)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(invoice.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(invoice.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {invoiceToPrint && (
        <div className="hidden">
          <InvoicePreview ref={printRef} invoice={invoiceToPrint} />
        </div>
      )}
    </div>
  );
}
