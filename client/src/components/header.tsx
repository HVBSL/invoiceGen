import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onNewInvoice?: () => void;
}

export function Header({ onNewInvoice }: HeaderProps) {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden text-xl font-semibold text-foreground sm:block">
              InvoiceGen
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/">
            <Button
              variant={location === "/" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "text-sm",
                location === "/" && "bg-secondary"
              )}
              data-testid="link-invoices"
            >
              Invoices
            </Button>
          </Link>
          <Link href="/clients">
            <Button
              variant={location === "/clients" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "text-sm",
                location === "/clients" && "bg-secondary"
              )}
              data-testid="link-clients"
            >
              Clients
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant={location === "/settings" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "text-sm",
                location === "/settings" && "bg-secondary"
              )}
              data-testid="link-settings"
            >
              Settings
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {onNewInvoice && (
            <Button
              onClick={onNewInvoice}
              size="sm"
              className="gap-1.5"
              data-testid="button-new-invoice"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Invoice</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
