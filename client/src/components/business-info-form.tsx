import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BusinessInfo } from "@shared/schema";
import { useRef } from "react";
import { getEmailError, getPhoneError } from "@/lib/validation-utils";
import { cn } from "@/lib/utils";

interface BusinessInfoFormProps {
  businessInfo: BusinessInfo;
  onChange: (info: BusinessInfo) => void;
  compact?: boolean;
}

export function BusinessInfoForm({
  businessInfo,
  onChange,
  compact = false,
}: BusinessInfoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailError = getEmailError(businessInfo.email || "");
  const phoneError = getPhoneError(businessInfo.phone || "");

  const updateField = (field: keyof BusinessInfo, value: string) => {
    onChange({ ...businessInfo, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("logo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateField("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {businessInfo.logo ? (
            <div className="relative">
              <img
                src={businessInfo.logo}
                alt="Business logo"
                className="h-16 w-16 rounded-lg object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6"
                onClick={removeLogo}
                aria-label="Remove logo"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground/50 transition-colors hover:border-primary hover:text-primary"
              aria-label="Upload logo"
              data-testid="button-upload-logo-compact"
            >
              <Upload className="h-5 w-5" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            data-testid="input-logo-file-compact"
          />
          <div className="flex-1 space-y-1">
            <Input
              value={businessInfo.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your Business Name"
              className="border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
              data-testid="input-business-name-compact"
            />
            <div>
              <Input
                value={businessInfo.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="email@business.com"
                type="email"
                className={cn(
                  "border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0",
                  emailError && "text-destructive"
                )}
                data-testid="input-business-email-compact"
              />
              {emailError && (
                <p className="text-xs text-destructive" data-testid="error-business-email-compact">
                  {emailError}
                </p>
              )}
            </div>
          </div>
        </div>
        <Textarea
          value={businessInfo.address || ""}
          onChange={(e) => updateField("address", e.target.value)}
          placeholder="Business address..."
          className="min-h-[60px] resize-none"
          data-testid="input-business-address-compact"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              value={businessInfo.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="Phone"
              className={cn(phoneError && "border-destructive")}
              data-testid="input-business-phone-compact"
            />
            {phoneError && (
              <p className="mt-1 text-xs text-destructive" data-testid="error-business-phone-compact">
                {phoneError}
              </p>
            )}
          </div>
          <Input
            value={businessInfo.taxId || ""}
            onChange={(e) => updateField("taxId", e.target.value)}
            placeholder="Tax ID"
            data-testid="input-business-taxid-compact"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">Business Logo</Label>
        {businessInfo.logo ? (
          <div className="relative inline-block">
            <img
              src={businessInfo.logo}
              alt="Business logo"
              className="h-24 w-24 rounded-lg object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6"
              onClick={removeLogo}
              aria-label="Remove logo"
              data-testid="button-remove-logo"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground/50 transition-colors hover:border-primary hover:text-primary"
            aria-label="Upload logo"
            data-testid="button-upload-logo"
          >
            <Upload className="h-6 w-6" />
            <span className="text-xs">Upload</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
          data-testid="input-logo-file"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="businessName" className="mb-2 block">
            Business Name
          </Label>
          <Input
            id="businessName"
            value={businessInfo.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your Business Name"
            data-testid="input-business-name"
          />
        </div>

        <div>
          <Label htmlFor="businessEmail" className="mb-2 block">
            Email
          </Label>
          <Input
            id="businessEmail"
            type="email"
            value={businessInfo.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="email@business.com"
            className={cn(emailError && "border-destructive")}
            data-testid="input-business-email"
          />
          {emailError && (
            <p className="mt-1 text-xs text-destructive" data-testid="error-business-email">
              {emailError}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="businessPhone" className="mb-2 block">
            Phone
          </Label>
          <Input
            id="businessPhone"
            value={businessInfo.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={cn(phoneError && "border-destructive")}
            data-testid="input-business-phone"
          />
          {phoneError && (
            <p className="mt-1 text-xs text-destructive" data-testid="error-business-phone">
              {phoneError}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="businessAddress" className="mb-2 block">
            Address
          </Label>
          <Textarea
            id="businessAddress"
            value={businessInfo.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="123 Business Street&#10;City, State 12345"
            className="min-h-[80px] resize-none"
            data-testid="input-business-address"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="taxId" className="mb-2 block">
            Tax ID / Business Registration
          </Label>
          <Input
            id="taxId"
            value={businessInfo.taxId || ""}
            onChange={(e) => updateField("taxId", e.target.value)}
            placeholder="XX-XXXXXXX"
            data-testid="input-business-taxid"
          />
        </div>
      </div>
    </div>
  );
}
