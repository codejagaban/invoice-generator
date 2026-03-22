"use client";

/**
 * Company Form Component
 * Form for creating and editing company/freelancer details
 */

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import type { CompanyDetails } from "@/app/lib/types";

interface CompanyFormProps {
  initialData?: CompanyDetails;
  onSubmit: (data: CompanyDetails) => Promise<void>;
  onCancel?: () => void;
}

export default function CompanyForm({
  initialData,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | undefined>(initialData?.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    country: initialData?.country || "US",
    website: initialData?.website || "",
    taxId: initialData?.taxId || "",
    isDefault: initialData?.isDefault || false,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // Convert SVG to PNG for html2canvas/PDF compatibility
      if (file.type === "image/svg+xml") {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 200;
          canvas.height = img.naturalHeight || 200;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          setLogo(canvas.toDataURL("image/png"));
        };
        img.src = dataUrl;
      } else {
        setLogo(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);

    try {
      const company: CompanyDetails = {
        id: initialData?.id || String(Date.now()),
        ...formData,
        logo,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSubmit(company);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save company details",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData ? "Edit" : "Add"} Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-(--muted) mb-2">
              Company Logo
            </label>
            <div className="flex items-start gap-4">
              {logo ? (
                <div className="relative shrink-0">
                  <img
                    src={logo}
                    alt="Company logo preview"
                    className="h-20 w-20 rounded-lg object-contain border border-(--border) bg-(--surface-raised) p-1"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Remove logo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-(--border) bg-(--surface-raised) text-(--muted)">
                  <ImagePlus className="h-6 w-6" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-2 text-sm font-medium text-black hover:bg-(--border) dark:text-white transition-colors"
                >
                  <ImagePlus className="h-4 w-4" />
                  {logo ? "Change Logo" : "Upload Logo"}
                </label>
                <p className="text-xs text-(--muted)">
                  PNG, JPG, SVG · Max 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Company/Freelance Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <Input
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
            <Input
              label="State/Province"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
            />
            <Input
              label="Zip/Postal Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
            />
            <Input
              label="Tax ID (Optional)"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="rounded border-(--border)"
            />
            <span className="text-(--muted)">
              Set as default company profile
            </span>
          </label>

          {submitError && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {submitError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Company Details"}
        </Button>
      </div>
    </form>
  );
}
