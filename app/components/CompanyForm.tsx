"use client";

/**
 * Company Form Component
 * Form for creating and editing company/freelancer details
 */

import { useState } from "react";
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      const newErrors: Record<string, string> = {};
      if (!formData.name.trim()) newErrors.name = "Company name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      const company: CompanyDetails = {
        id: initialData?.id || String(Date.now()),
        ...formData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSubmit(company);
      setErrors({});
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to save company details",
      });
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Company/Freelance Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
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
            error={errors.address}
            required
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              error={errors.city}
              required
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

          {errors.submit && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {errors.submit}
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
