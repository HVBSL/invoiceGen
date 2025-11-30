import { useState } from "react";
import { Header } from "@/components/header";
import { InvoiceList } from "@/components/invoice-list";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePreviewDialog } from "@/components/invoice-preview-dialog";
import { useInvoice } from "@/lib/invoice-context";
import { deepClone } from "@/lib/invoice-utils";
import type { Invoice } from "@shared/schema";

type View = "list" | "form";

export default function Home() {
  const [view, setView] = useState<View>("list");
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const {
    invoices,
    currentInvoice,
    setCurrentInvoice,
    createNewInvoice,
    saveInvoice,
    deleteInvoice,
    duplicateInvoiceById,
  } = useInvoice();

  const handleNewInvoice = () => {
    const newInvoice = createNewInvoice();
    setCurrentInvoice(newInvoice);
    setView("form");
  };

  const handleEdit = (invoice: Invoice) => {
    setCurrentInvoice(deepClone(invoice));
    setView("form");
  };

  const handleSave = (invoice: Invoice) => {
    saveInvoice(invoice);
    setView("list");
    setCurrentInvoice(null);
  };

  const handleClose = () => {
    setView("list");
    setCurrentInvoice(null);
  };

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(deepClone(invoice));
    setPreviewOpen(true);
  };

  const handleDuplicate = (id: string) => {
    return duplicateInvoiceById(id);
  };

  return (
    <div className="min-h-screen bg-background">
      {view === "list" && <Header onNewInvoice={handleNewInvoice} />}
      
      <main>
        {view === "list" ? (
          <div className="container mx-auto px-4 py-6">
            <InvoiceList
              invoices={invoices}
              onEdit={handleEdit}
              onDelete={deleteInvoice}
              onDuplicate={handleDuplicate}
              onPreview={handlePreview}
              onNewInvoice={handleNewInvoice}
            />
          </div>
        ) : (
          currentInvoice && (
            <InvoiceForm
              invoice={currentInvoice}
              onSave={handleSave}
              onClose={handleClose}
            />
          )
        )}
      </main>

      <InvoicePreviewDialog
        invoice={previewInvoice}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
