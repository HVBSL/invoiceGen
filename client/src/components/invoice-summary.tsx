import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LineItem } from "@shared/schema";
import {
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
  formatCurrency,
} from "@/lib/invoice-utils";

interface InvoiceSummaryProps {
  lineItems: LineItem[];
  discountAmount: number;
  onDiscountChange?: (amount: number) => void;
  readonly?: boolean;
}

export function InvoiceSummary({
  lineItems,
  discountAmount,
  onDiscountChange,
  readonly = false,
}: InvoiceSummaryProps) {
  const subtotal = calculateSubtotal(lineItems);
  const taxAmount = calculateTaxAmount(lineItems);
  const total = calculateTotal(lineItems, discountAmount);

  const handleDiscountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    onDiscountChange?.(Math.max(0, numValue));
  };

  return (
    <div className="ml-auto w-full max-w-xs space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium" data-testid="text-subtotal">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Tax</span>
        <span className="font-medium" data-testid="text-tax">
          {formatCurrency(taxAmount)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <Label htmlFor="discount" className="text-muted-foreground">
          Discount
        </Label>
        {readonly ? (
          <span className="font-medium text-destructive" data-testid="text-discount">
            -{formatCurrency(discountAmount)}
          </span>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">-$</span>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discountAmount}
              onChange={(e) => handleDiscountChange(e.target.value)}
              className="h-8 w-24 text-right"
              data-testid="input-discount"
              aria-label="Discount amount"
            />
          </div>
        )}
      </div>

      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-xl font-bold text-primary" data-testid="text-total">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
