import { Printer, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InvoicePreview } from "./invoice-preview";
import type { Invoice } from "@shared/schema";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface InvoicePreviewDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoicePreviewDialog({
  invoice,
  open,
  onOpenChange,
}: InvoicePreviewDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  if (!invoice) return null;

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
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-900 { color: #111827; }
            .mb-8 { margin-bottom: 32px; }
            .p-8 { padding: 32px; }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="sticky top-0 z-10 flex flex-row items-center justify-between gap-4 border-b bg-background p-4">
          <DialogTitle className="text-lg font-semibold">
            Preview: {invoice.invoiceNumber}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
              data-testid="button-preview-print"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="gap-1.5"
              data-testid="button-preview-download"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto bg-muted/30 p-4">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border shadow-lg">
            <InvoicePreview ref={previewRef} invoice={invoice} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
