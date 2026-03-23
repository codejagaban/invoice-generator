"use client";

/**
 * Customers Page
 * Route: /customers
 */

import { useEffect, useRef, useState } from "react";
import { useDbReady } from "@/app/components/DbScopeProvider";
import {
  User,
  Mail,
  MapPin,
  Map,
  Hash,
  Globe,
  ImagePlus,
  UserPlus,
  UserCheck,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shared/Select";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import type { Customer } from "@/app/lib/types";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/app/lib/storage";
import { CustomerListSkeleton } from "@/app/components/shared/Skeleton";
import EmptyState from "@/app/components/shared/EmptyState";
import { Users } from "lucide-react";

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus",
  "Belgium", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Estonia",
  "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece",
  "Guatemala", "Honduras", "Hong Kong", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon",
  "Libya", "Lithuania", "Luxembourg", "Malaysia", "Malta", "Mexico",
  "Moldova", "Morocco", "Mozambique", "Myanmar", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Nigeria", "North Korea", "Norway", "Oman",
  "Pakistan", "Panama", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Senegal",
  "Serbia", "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey",
  "Uganda", "Ukraine", "United Arab Emirates", "Uruguay", "Uzbekistan",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

export default function CustomersPage() {
  const dbReady = useDbReady();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [logoError, setLogoError] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United Kingdom",
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Please upload a valid image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Image must be smaller than 2MB");
      return;
    }

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
          setLogoError(undefined);
        };
        img.onerror = () => {
          setLogoError("Failed to process SVG image");
        };
        img.src = dataUrl;
      } else {
        setLogo(dataUrl);
        setLogoError(undefined);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const data = await getCustomers();
      setCustomers(data);
      setIsLoading(false);
    })();
  }, [dbReady]);

  const resetForm = () => {
    setEditingId(null);
    setLogo(undefined);
    setLogoError(undefined);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormData({
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United Kingdom",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear this field's error as the user types
    if (errors[name]) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[name];
        return rest;
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setLogo(customer.logo);
    setLogoError(undefined);
    setFormData({
      name: customer.name,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      country: customer.country,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await deleteCustomer(id);
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (editingId) {
      const updated = await updateCustomer(editingId, { ...formData, logo });
      if (updated) {
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === editingId ? updated : customer,
          ),
        );
      }
    } else {
      const newCustomer: Customer = {
        id: String(Date.now()),
        ...formData,
        logo,
      };
      const created = await createCustomer(newCustomer);
      setCustomers((prev) => [...prev, created]);
    }

    resetForm();
  };

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Customers
          </h1>
          <p className="mt-2 text-sm text-(--muted)">
            Create and manage your customer list for faster invoice creation.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {isLoading ? (
          <CustomerListSkeleton />
        ) :
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? "Edit Customer" : "Add Customer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-(--muted) mb-2">
                    Customer Logo
                  </label>
                  <div className="flex items-start gap-4">
                    {logo ? (
                      <div className="relative shrink-0">
                        <img
                          src={logo}
                          alt="Customer logo preview"
                          className="h-16 w-16 rounded-lg object-contain border border-(--border) bg-(--surface-raised) p-1"
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
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-(--border) bg-(--surface-raised) text-(--muted)">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="customer-logo-upload"
                      />
                      <label
                        htmlFor="customer-logo-upload"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-2 text-sm font-medium text-black hover:bg-(--border) dark:text-white transition-colors"
                      >
                        <ImagePlus className="h-4 w-4" />
                        {logo ? "Change Logo" : "Upload Logo"}
                      </label>
                      <p className="text-xs text-(--muted)">PNG, JPG, SVG · Max 2MB</p>
                      {logoError && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {logoError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    leadingIcon={<User className="h-4 w-4" />}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    leadingIcon={<Mail className="h-4 w-4" />}
                    error={errors.email}
                    required
                  />
                </div>
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  leadingIcon={<MapPin className="h-4 w-4" />}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    leadingIcon={<Map className="h-4 w-4" />}
                  />
                  <Input
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    leadingIcon={<Map className="h-4 w-4" />}
                  />
                  <Input
                    label="Zip Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    leadingIcon={<Hash className="h-4 w-4" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-(--muted) mb-1">
                    Country
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                      <Globe className="h-4 w-4" />
                    </span>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, country: value }))
                      }
                    >
                      <SelectTrigger className="pl-9">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit">
                    {editingId ? (
                      <>
                        <UserCheck className="h-4 w-4 text-green-400" />
                        Update Customer
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 text-green-400" />
                        Add Customer
                      </>
                    )}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                    >
                      <X className="h-4 w-4 text-red-500" />
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {customers.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Users}
                  title="No customers yet"
                  description="Add your first customer using the form to get started."
                />
              </Card>
            ) : (
              customers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      {customer.logo && (
                        <img
                          src={customer.logo}
                          alt={`${customer.name} logo`}
                          className="h-10 w-10 rounded-lg object-contain border border-(--border) bg-(--surface-raised) p-0.5 shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-black dark:text-white">
                          {customer.name}
                        </p>
                        <p className="text-sm text-(--muted)">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-(--muted)">
                      {customer.address && <p>{customer.address}</p>}
                      {(customer.city ||
                        customer.state ||
                        customer.zipCode) && (
                        <p>
                          {customer.city}
                          {customer.city && customer.state ? ", " : ""}
                          {customer.state} {customer.zipCode}
                        </p>
                      )}
                      {customer.country && <p>{customer.country}</p>}
                    </div>
                    <div className="flex gap-2 border-t pt-3 border-(--border)">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-9 px-0"
                        onClick={() => handleEdit(customer)}
                        aria-label="Edit customer"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-9 px-0"
                        onClick={() => handleDelete(customer.id)}
                        aria-label="Delete customer"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        }
      </main>
    </div>
  );
}
