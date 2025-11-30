import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus } from "@shared/schema";
import { getStatusColor } from "@/lib/invoice-utils";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = getStatusColor(status);
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge
      variant="outline"
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        "font-medium",
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      {label}
    </Badge>
  );
}
