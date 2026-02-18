"use client";

/**
 * Customers Page
 * Route: /customers
 */

import { useEffect, useState } from "react";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    const data = getCustomers();
    setCustomers(data);
    setIsLoading(false);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
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

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    deleteCustomer(id);
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Customer name and email are required.");
      return;
    }

    if (editingId) {
      const updated = updateCustomer(editingId, formData);
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
      };
      const created = createCustomer(newCustomer);
      setCustomers((prev) => [...prev, created]);
    }

    resetForm();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Customers
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create and manage your customer list for faster invoice creation.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? "Edit Customer" : "Add Customer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
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
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Zip Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
                <Input
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                />

                <div className="flex gap-3">
                  <Button type="submit">
                    {editingId ? "Update Customer" : "Add Customer"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                    >
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
                <div className="py-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No customers yet. Add your first customer to get started.
                  </p>
                </div>
              </Card>
            ) : (
              customers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold text-black dark:text-white">
                        {customer.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {customer.email}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
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
                    <div className="flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
