'use client';

import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useDataStore } from '@/lib/data-store';
import { toast } from 'sonner';
import { Customer } from '@/lib/models';

type CustomerForm = {
  customer_code: string;
  name: string;
  organization_type: string;
  primary_contact_name: string;
  email: string;
  phone: string;
  country: string;
  status: 'active' | 'inactive';
};

export default function CustomersPage() {
  const { customers, loading, createCustomer, updateCustomer, deleteCustomer } = useDataStore();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CustomerForm>({
    customer_code: '',
    name: '',
    organization_type: '',
    primary_contact_name: '',
    email: '',
    phone: '',
    country: '',
    status: 'active',
  });
  const filtered = customers.filter((c) => {
    const term = search.toLowerCase();

    return (
      c.customer_code?.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      c.primary_contact_name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term)
    );
  });
  async function handleCreate() {
   if (!formData.customer_code?.trim() || !formData.name.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await createCustomer(formData);
      setFormData({
          customer_code: '',
          name: '',
          organization_type: '',
          primary_contact_name: '',
          email: '',
          phone: '',
          country: '',
          status: 'active',
        });
      setIsCreateOpen(false);
    } catch {
      // Error handled by DataStore
    }
  }

  async function handleUpdate() {
    if (!editingId) return;
    if (!formData.customer_code?.trim() || !formData.name.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await updateCustomer(editingId, formData);
      setFormData({
        customer_code: '',
        name: '',
        organization_type: '',
        primary_contact_name: '',
        email: '',
        phone: '',
        country: '',
        status: 'active',
      });
      setEditingId(null);
      setIsEditOpen(false);
    } catch {
      // Error handled by DataStore
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await deleteCustomer(id);
    } catch {
      // Error handled by DataStore
    }
  }

  function openEdit(customer: Customer) {
    setEditingId(customer.id);

    setFormData({
      customer_code: customer.customer_code,
      name: customer.name,
      organization_type: customer.organization_type ?? '',
      primary_contact_name: customer.primary_contact_name ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      country: customer.country ?? '',
      status: customer.status ?? 'active',
    });

    setIsEditOpen(true);
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground mt-2">Manage your customer list</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code, name, contact, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Enter customer details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Info</Label>
                <Input
                  id="contact"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  placeholder="Email or phone"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>Total: {filtered.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.customer_code}</TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.name}</p>

                          {customer.organization_type && (
                            <p className="text-xs text-muted-foreground">
                              {customer.organization_type}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          {customer.primary_contact_name && (
                            <p>{customer.primary_contact_name}</p>
                          )}

                          {customer.phone && (
                            <p className="text-xs text-muted-foreground">
                              {customer.phone}
                            </p>
                          )}

                          {customer.email && (
                            <p className="text-xs text-muted-foreground">
                              {customer.email}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            customer.status === "active"
                              ? "default"
                              : customer.status === "inactive"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label htmlFor="edit-contact">Contact Info</Label>
              <Input
                id="edit-contact"
                value={formData.contact_info}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                placeholder="Email or phone"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Edit Customer</DialogTitle>
      <DialogDescription>
        Update customer information.
      </DialogDescription>
    </DialogHeader>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div>
        <Label htmlFor="edit-customer-code">Customer Code</Label>
        <Input
          id="edit-customer-code"
          value={formData.customer_code}
          onChange={(e) =>
            setFormData({ ...formData, customer_code: e.target.value })
          }
          placeholder="e.g. CUST-001"
        />
      </div>

      <div>
        <Label htmlFor="edit-name">Customer Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="Customer name"
        />
      </div>

      <div>
        <Label htmlFor="edit-org-type">Organization Type</Label>
        <Input
          id="edit-org-type"
          value={formData.organization_type || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              organization_type: e.target.value,
            })
          }
          placeholder="Government / Private / NGO"
        />
      </div>

      <div>
        <Label htmlFor="edit-contact-person">
          Primary Contact
        </Label>
        <Input
          id="edit-contact-person"
          value={formData.primary_contact_name || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              primary_contact_name: e.target.value,
            })
          }
          placeholder="Contact person name"
        />
      </div>

      <div>
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={formData.email || ""}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          placeholder="customer@example.com"
        />
      </div>

      <div>
        <Label htmlFor="edit-phone">Phone</Label>
        <Input
          id="edit-phone"
          value={formData.phone || ""}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          placeholder="+92 XXX XXXXXXX"
        />
      </div>

      <div>
        <Label htmlFor="edit-country">Country</Label>
        <Input
          id="edit-country"
          value={formData.country || ""}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
          placeholder="Pakistan"
        />
      </div>

      <div>
        <Label htmlFor="edit-status">Status</Label>
        <select
          id="edit-status"
          value={formData.status || "active"}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value })
          }
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospect</option>
        </select>
      </div>
    </div>

    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={() => setIsEditOpen(false)}
      >
        Cancel
      </Button>

      <Button onClick={handleUpdate}>
        Update Customer
      </Button>
    </div>
  </DialogContent>
    </Dialog>
    </div>  
  );
}
