import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@shared/schema";
import { ClientSelector } from "./client-selector";

interface ClientInfoFormProps {
  client: Client;
  onChange: (client: Client) => void;
  showSelector?: boolean;
  compact?: boolean;
}

export function ClientInfoForm({
  client,
  onChange,
  showSelector = true,
  compact = false,
}: ClientInfoFormProps) {
  const updateField = (field: keyof Client, value: string) => {
    onChange({ ...client, [field]: value });
  };

  const handleSelectClient = (selectedClient: Client) => {
    onChange(selectedClient);
  };

  const handleAddNewClient = () => {
    onChange({
      ...client,
      id: `new-${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {showSelector && (
          <ClientSelector
            selectedClient={client.name ? client : null}
            onSelectClient={handleSelectClient}
            onAddNewClient={handleAddNewClient}
          />
        )}
        <div className="space-y-3">
          <Input
            value={client.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Client Name"
            className="font-medium"
            data-testid="input-client-name-compact"
          />
          <Input
            value={client.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="client@email.com"
            type="email"
            data-testid="input-client-email-compact"
          />
          <Textarea
            value={client.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Client address..."
            className="min-h-[60px] resize-none"
            data-testid="input-client-address-compact"
          />
          <Input
            value={client.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="Phone"
            data-testid="input-client-phone-compact"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSelector && (
        <div>
          <Label className="mb-2 block">Select Existing Client</Label>
          <ClientSelector
            selectedClient={client.name ? client : null}
            onSelectClient={handleSelectClient}
            onAddNewClient={handleAddNewClient}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="clientName" className="mb-2 block">
            Client Name
          </Label>
          <Input
            id="clientName"
            value={client.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Client or Company Name"
            data-testid="input-client-name"
          />
        </div>

        <div>
          <Label htmlFor="clientEmail" className="mb-2 block">
            Email
          </Label>
          <Input
            id="clientEmail"
            type="email"
            value={client.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="client@email.com"
            data-testid="input-client-email"
          />
        </div>

        <div>
          <Label htmlFor="clientPhone" className="mb-2 block">
            Phone
          </Label>
          <Input
            id="clientPhone"
            value={client.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
            data-testid="input-client-phone"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="clientAddress" className="mb-2 block">
            Billing Address
          </Label>
          <Textarea
            id="clientAddress"
            value={client.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="123 Client Street&#10;City, State 12345"
            className="min-h-[80px] resize-none"
            data-testid="input-client-address"
          />
        </div>
      </div>
    </div>
  );
}
