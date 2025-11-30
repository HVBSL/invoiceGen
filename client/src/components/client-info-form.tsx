import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@shared/schema";
import { ClientSelector } from "./client-selector";
import { getEmailError, getPhoneError } from "@/lib/validation-utils";
import { cn } from "@/lib/utils";

interface ClientInfoFormProps {
  client: Client;
  onChange: (client: Client) => void;
  showSelector?: boolean;
  compact?: boolean;
  isExistingClient?: boolean;
  onClearClient?: () => void;
}

export function ClientInfoForm({
  client,
  onChange,
  showSelector = true,
  compact = false,
  isExistingClient = false,
  onClearClient,
}: ClientInfoFormProps) {
  const emailError = getEmailError(client.email || "");
  const phoneError = getPhoneError(client.phone || "");

  const updateField = (field: keyof Client, value: string) => {
    if (isExistingClient) return;
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
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ClientSelector
                selectedClient={client.name ? client : null}
                onSelectClient={handleSelectClient}
                onAddNewClient={handleAddNewClient}
              />
            </div>
            {isExistingClient && onClearClient && (
              <button
                type="button"
                onClick={onClearClient}
                className="text-sm text-primary hover:underline"
                data-testid="button-clear-client"
              >
                Clear
              </button>
            )}
          </div>
        )}
        <div className="space-y-3">
          <div>
            <Input
              value={client.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Client Name"
              className={cn("font-medium", isExistingClient && "bg-muted cursor-not-allowed")}
              disabled={isExistingClient}
              data-testid="input-client-name-compact"
            />
          </div>
          <div>
            <Input
              value={client.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="client@email.com"
              type="email"
              className={cn(
                isExistingClient && "bg-muted cursor-not-allowed",
                emailError && "border-destructive"
              )}
              disabled={isExistingClient}
              data-testid="input-client-email-compact"
            />
            {emailError && (
              <p className="mt-1 text-xs text-destructive" data-testid="error-client-email">
                {emailError}
              </p>
            )}
          </div>
          <Textarea
            value={client.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Client address..."
            className={cn("min-h-[60px] resize-none", isExistingClient && "bg-muted cursor-not-allowed")}
            disabled={isExistingClient}
            data-testid="input-client-address-compact"
          />
          <div>
            <Input
              value={client.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="Phone"
              className={cn(
                isExistingClient && "bg-muted cursor-not-allowed",
                phoneError && "border-destructive"
              )}
              disabled={isExistingClient}
              data-testid="input-client-phone-compact"
            />
            {phoneError && (
              <p className="mt-1 text-xs text-destructive" data-testid="error-client-phone">
                {phoneError}
              </p>
            )}
          </div>
        </div>
        {isExistingClient && (
          <p className="text-xs text-muted-foreground">
            Editing existing client info. To change, click "Clear" and enter new details.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSelector && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label className="mb-2 block">Select Existing Client</Label>
            <ClientSelector
              selectedClient={client.name ? client : null}
              onSelectClient={handleSelectClient}
              onAddNewClient={handleAddNewClient}
            />
          </div>
          {isExistingClient && onClearClient && (
            <button
              type="button"
              onClick={onClearClient}
              className="mt-6 text-sm text-primary hover:underline"
              data-testid="button-clear-client-full"
            >
              Clear
            </button>
          )}
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
            disabled={isExistingClient}
            className={cn(isExistingClient && "bg-muted cursor-not-allowed")}
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
            disabled={isExistingClient}
            className={cn(
              isExistingClient && "bg-muted cursor-not-allowed",
              emailError && "border-destructive"
            )}
            data-testid="input-client-email"
          />
          {emailError && (
            <p className="mt-1 text-xs text-destructive" data-testid="error-client-email-full">
              {emailError}
            </p>
          )}
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
            disabled={isExistingClient}
            className={cn(
              isExistingClient && "bg-muted cursor-not-allowed",
              phoneError && "border-destructive"
            )}
            data-testid="input-client-phone"
          />
          {phoneError && (
            <p className="mt-1 text-xs text-destructive" data-testid="error-client-phone-full">
              {phoneError}
            </p>
          )}
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
            className={cn("min-h-[80px] resize-none", isExistingClient && "bg-muted cursor-not-allowed")}
            disabled={isExistingClient}
            data-testid="input-client-address"
          />
        </div>
      </div>

      {isExistingClient && (
        <p className="text-sm text-muted-foreground">
          This client was selected from your saved clients. Click "Clear" to enter new client details.
        </p>
      )}
    </div>
  );
}
