import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessInfoForm } from "@/components/business-info-form";
import { useInvoice } from "@/lib/invoice-context";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { businessInfo, updateBusinessInfo, invoices } = useInvoice();
  const { toast } = useToast();

  const handleSave = () => {
    updateBusinessInfo(businessInfo);
    toast({
      title: "Settings Saved",
      description: "Your business information has been updated.",
    });
  };

  const handleClearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const updateField = (field: keyof typeof businessInfo, value: string) => {
    updateBusinessInfo({ ...businessInfo, [field]: value });
  };

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.status === "paid").length;
  const pendingInvoices = invoices.filter((inv) => inv.status === "sent").length;
  const draftInvoices = invoices.filter((inv) => inv.status === "draft").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your business information and app settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  This information will appear on all your invoices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessInfoForm
                  businessInfo={businessInfo}
                  onChange={updateBusinessInfo}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Invoice Settings</CardTitle>
                <CardDescription>
                  These values will be used as defaults when creating new invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultPaymentTerms" className="mb-2 block">
                    Default Payment Terms
                  </Label>
                  <Textarea
                    id="defaultPaymentTerms"
                    value={businessInfo.defaultPaymentTerms || ""}
                    onChange={(e) => updateField("defaultPaymentTerms", e.target.value)}
                    placeholder="Payment due within 30 days of invoice date."
                    className="min-h-[80px] resize-none"
                    data-testid="input-default-payment-terms"
                  />
                </div>
                <div>
                  <Label htmlFor="defaultNotes" className="mb-2 block">
                    Default Notes
                  </Label>
                  <Textarea
                    id="defaultNotes"
                    value={businessInfo.defaultNotes || ""}
                    onChange={(e) => updateField("defaultNotes", e.target.value)}
                    placeholder="Thank you for your business!"
                    className="min-h-[80px] resize-none"
                    data-testid="input-default-notes"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} className="gap-1.5" data-testid="button-save-settings">
                <Save className="h-4 w-4" />
                Save All Settings
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Invoices</span>
                  <span className="font-semibold" data-testid="text-total-invoices">{totalInvoices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-semibold text-green-600" data-testid="text-paid-invoices">{paidInvoices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold text-blue-600" data-testid="text-pending-invoices">{pendingInvoices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drafts</span>
                  <span className="font-semibold text-muted-foreground" data-testid="text-draft-invoices">{draftInvoices}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-1.5" data-testid="button-clear-data">
                      <Trash2 className="h-4 w-4" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your invoices, clients, and settings.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAllData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="button-confirm-clear"
                      >
                        Clear All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
