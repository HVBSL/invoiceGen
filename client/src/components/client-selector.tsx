import { useState } from "react";
import { Check, ChevronsUpDown, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInvoice } from "@/lib/invoice-context";
import type { Client } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ClientSelectorProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onAddNewClient: () => void;
}

export function ClientSelector({
  selectedClient,
  onSelectClient,
  onAddNewClient,
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const { clients } = useInvoice();

  const handleSelectClient = (client: Client) => {
    onSelectClient(client);
    setOpen(false);
  };

  const handleAddNew = () => {
    setOpen(false);
    onAddNewClient();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          data-testid="button-select-client"
        >
          {selectedClient?.name ? (
            <span className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 text-muted-foreground" />
              {selectedClient.name}
            </span>
          ) : (
            <span className="text-muted-foreground">Select a client...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search clients..." data-testid="input-search-clients" />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => handleSelectClient(client)}
                  className="cursor-pointer"
                  data-testid={`option-client-${client.id}`}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{client.name}</span>
                    {client.email && (
                      <span className="text-xs text-muted-foreground">
                        {client.email}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={handleAddNew}
                className="cursor-pointer"
                data-testid="button-add-new-client"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add new client
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
