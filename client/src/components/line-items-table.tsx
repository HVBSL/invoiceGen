import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LineItem } from "@shared/schema";
import {
  calculateLineItemAmount,
  formatCurrency,
  createEmptyLineItem,
} from "@/lib/invoice-utils";
import { cn } from "@/lib/utils";

interface LineItemsTableProps {
  lineItems: LineItem[];
  onChange: (lineItems: LineItem[]) => void;
  readonly?: boolean;
}

export function LineItemsTable({
  lineItems,
  onChange,
  readonly = false,
}: LineItemsTableProps) {
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    onChange(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    onChange([...lineItems, createEmptyLineItem()]);
  };

  const removeItem = (id: string) => {
    if (lineItems.length === 1) return;
    onChange(lineItems.filter((item) => item.id !== id));
  };

  const handleNumberChange = (
    id: string,
    field: "quantity" | "unitPrice" | "taxRate",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.max(0, numValue);
    updateItem(id, field, clampedValue);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">
                Description
              </th>
              <th className="w-24 px-3 py-3 text-right text-sm font-medium text-muted-foreground">
                Qty
              </th>
              <th className="w-32 px-3 py-3 text-right text-sm font-medium text-muted-foreground">
                Unit Price
              </th>
              <th className="w-24 px-3 py-3 text-right text-sm font-medium text-muted-foreground">
                Tax %
              </th>
              <th className="w-32 px-3 py-3 text-right text-sm font-medium text-muted-foreground">
                Amount
              </th>
              {!readonly && (
                <th className="w-12 px-3 py-3 text-center text-sm font-medium text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b transition-colors",
                  index % 2 === 0 ? "bg-transparent" : "bg-muted/20"
                )}
                data-testid={`row-line-item-${index}`}
              >
                <td className="px-3 py-2">
                  {readonly ? (
                    <span className="text-sm">{item.description}</span>
                  ) : (
                    <Input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Item description"
                      className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                      data-testid={`input-description-${index}`}
                      aria-label="Item description"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readonly ? (
                    <span className="block text-right text-sm">{item.quantity}</span>
                  ) : (
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => handleNumberChange(item.id, "quantity", e.target.value)}
                      className="h-9 border-0 bg-transparent px-0 text-right shadow-none focus-visible:ring-0"
                      data-testid={`input-quantity-${index}`}
                      aria-label="Quantity"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readonly ? (
                    <span className="block text-right text-sm">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  ) : (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleNumberChange(item.id, "unitPrice", e.target.value)}
                      className="h-9 border-0 bg-transparent px-0 text-right shadow-none focus-visible:ring-0"
                      data-testid={`input-unit-price-${index}`}
                      aria-label="Unit price"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readonly ? (
                    <span className="block text-right text-sm">{item.taxRate}%</span>
                  ) : (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.taxRate}
                      onChange={(e) => handleNumberChange(item.id, "taxRate", e.target.value)}
                      className="h-9 border-0 bg-transparent px-0 text-right shadow-none focus-visible:ring-0"
                      data-testid={`input-tax-rate-${index}`}
                      aria-label="Tax rate percentage"
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-sm font-medium" data-testid={`text-amount-${index}`}>
                    {formatCurrency(calculateLineItemAmount(item))}
                  </span>
                </td>
                {!readonly && (
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                      data-testid={`button-remove-item-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readonly && (
        <Button
          variant="outline"
          size="sm"
          onClick={addItem}
          className="gap-1.5"
          data-testid="button-add-item"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      )}
    </div>
  );
}
