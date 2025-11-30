import { useState } from "react";
import { Plus, Search, Edit2, Trash2, MoreHorizontal, Users } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ClientInfoForm } from "@/components/client-info-form";
import { useInvoice } from "@/lib/invoice-context";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";
import { generateId, createEmptyClient } from "@/lib/invoice-utils";

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useInvoice();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClient = () => {
    setCurrentClient({ ...createEmptyClient(), id: generateId() });
    setEditDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    setEditDialogOpen(true);
  };

  const handleSaveClient = () => {
    if (!currentClient) return;

    if (!currentClient.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a client name.",
        variant: "destructive",
      });
      return;
    }

    const existingIndex = clients.findIndex((c) => c.id === currentClient.id);
    if (existingIndex >= 0) {
      updateClient(currentClient);
      toast({
        title: "Client Updated",
        description: `${currentClient.name} has been updated.`,
      });
    } else {
      addClient(currentClient);
      toast({
        title: "Client Added",
        description: `${currentClient.name} has been added.`,
      });
    }

    setEditDialogOpen(false);
    setCurrentClient(null);
  };

  const handleDeleteClick = (id: string) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      const client = clients.find((c) => c.id === clientToDelete);
      deleteClient(clientToDelete);
      toast({
        title: "Client Deleted",
        description: `${client?.name || "Client"} has been deleted.`,
      });
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Clients</h1>
          <Button onClick={handleAddClient} className="gap-1.5" data-testid="button-add-client">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-clients"
            />
          </div>
        </div>

        {clients.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">No clients yet</h2>
              <p className="mb-6 max-w-sm text-muted-foreground">
                Add your first client to quickly select them when creating invoices.
              </p>
              <Button onClick={handleAddClient} className="gap-1.5" data-testid="button-add-first-client">
                <Plus className="h-4 w-4" />
                Add Your First Client
              </Button>
            </CardContent>
          </Card>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
              <Search className="mb-4 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                No clients found matching your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover-elevate" data-testid={`card-client-${client.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <CardTitle className="text-lg font-semibold">{client.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-client-actions-${client.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClient(client)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(client.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {client.email && <p>{client.email}</p>}
                  {client.phone && <p>{client.phone}</p>}
                  {client.address && (
                    <p className="whitespace-pre-line">{client.address}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentClient && clients.find((c) => c.id === currentClient.id)
                ? "Edit Client"
                : "Add Client"}
            </DialogTitle>
          </DialogHeader>
          {currentClient && (
            <ClientInfoForm
              client={currentClient}
              onChange={setCurrentClient}
              showSelector={false}
            />
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-client"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveClient} data-testid="button-save-client">
              Save Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-client">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-client"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
