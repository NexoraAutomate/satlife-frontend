'use client';

import { useEffect, useState } from 'react';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/lib/api';
import * as Models from '@/lib/models';

type OrderForm = {
  order_number?: string
  title: string
  description?: string | null
  contract_number?: string | null
  po_number?: string | null
  order_date: string
  delivery_date?: string | null
  total_value?: number | null
  currency: string
  project_manager?: string | null
  remarks?: string | null

  customer_id?: number;
  status_id?: number;
  };
const emptyOrderForm: OrderForm = {
  order_number: '',
  title: '',
  description: '',
  contract_number: '',
  po_number: '',
  order_date: '',
  delivery_date: '',
  total_value: null,
  currency: '',
  project_manager: '',
  remarks: '',
  customer_id: undefined,
  status_id: undefined
 
};
export default function OrdersPage() {
  const { orders, customers, loading, createOrder, updateOrder, deleteOrder } = useDataStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<OrderForm>(emptyOrderForm);
  const [statuses, setStatuses] = useState<Models.Status[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [customer, setcustomer] = useState<Models.Customer[]>([]);

  const filtered = orders.filter((o) => {
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status_id?.toString() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleCreate() {
    if (
      !formData.title.trim() ||
      !formData.order_date ||
      !formData.currency.trim() ||
      !formData.status_id
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createOrder(formData);

      setFormData(emptyOrderForm);
      setIsCreateOpen(false);

      toast.success('Order created successfully');
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdate() {
    if (!editingId) return;

    if (
      !formData.title.trim() ||
      !formData.order_date ||
      !formData.currency.trim() ||
      !formData.status_id
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateOrder(editingId, formData);

      setFormData(emptyOrderForm);
      setEditingId(null);
      setIsEditOpen(false);

      toast.success('Order updated successfully');
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        'Are you sure you want to delete this order? All related Projects will also get deleted.'
      )
    )
      return;

    try {
      await deleteOrder(id);
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error(error);
    }
  }

  function openEdit(order: typeof orders[number]) {
    setEditingId(order.id);

    setFormData({
      order_number: order.order_number ?? '',
      title: order.title ?? '',
      description: order.description ?? '',
      contract_number: order.contract_number ?? '',
      po_number: order.po_number ?? '',
      order_date: order.order_date ?? '',
      delivery_date: order.delivery_date ?? '',
      total_value: order.total_value ?? null,
      currency: order.currency ?? '',
      project_manager: order.project_manager ?? '',
      remarks: order.remarks ?? '',
      status_id: order.status_id ?? undefined,
    });

    setIsEditOpen(true);
  }

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await api.statuses.list("orders"); //
        const cus = await api.customers.list( 0, 100);

        console.log(res.data) 
        setStatuses(res.data);
        setcustomer(cus.data);
      } catch (err) {
        console.error("Failed to fetch statuses", err);
      } finally {
        setLoadingStatuses(false);
      }
    };

    fetchStatuses();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage all orders</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
  <DialogTrigger asChild>
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      Add Order
    </Button>
  </DialogTrigger>

  <DialogContent className="sm:max-w-190 p-0">
    <DialogHeader className="border-b px-6 py-4">
      <DialogTitle className="text-lg font-semibold">Create Order</DialogTitle>
      <DialogDescription>Enter order details below.</DialogDescription>
    </DialogHeader>

    <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
      <div className="grid gap-5 md:grid-cols-2">
        {/* <div className="space-y-2">
          <Label htmlFor="order_number">Order Number</Label>
          <Input
            id="order_number"
            value={formData.order_number}
            onChange={(e) =>
              setFormData({ ...formData, order_number: e.target.value })
            }
            placeholder="ORD-001"
            className="h-10"
          />
        </div> */}

        <div className="space-y-2">
          <Label htmlFor="customer">Customer</Label>
          <Select
            value={formData.customer_id?.toString()}
            onValueChange={(v) =>
              setFormData({ ...formData, customer_id: parseInt(v, 10) })
            }
          >
            <SelectTrigger id="customer" className="h-10">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customer.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status_id?.toString()}
            onValueChange={(v) =>
              setFormData({ ...formData, status_id: parseInt(v, 10) })
            }
          >
            <SelectTrigger id="status" className="h-10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Order title"
            className="h-10"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className="min-h-22.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={formData.description ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contract_number">Contract Number</Label>
          <Input
            id="contract_number"
            value={formData.contract_number ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, contract_number: e.target.value })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="po_number">PO Number</Label>
          <Input
            id="po_number"
            value={formData.po_number ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, po_number: e.target.value })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order_date">Order Date</Label>
          <Input
            id="order_date"
            type="date"
            value={formData.order_date}
            onChange={(e) =>
              setFormData({ ...formData, order_date: e.target.value })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="delivery_date">Delivery Date</Label>
          <Input
            id="delivery_date"
            type="date"
            value={formData.delivery_date ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, delivery_date: e.target.value })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_value">Total Value</Label>
          <Input
            id="total_value"
            type="number"
            value={formData.total_value ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                total_value: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            placeholder="USD / PKR / EUR"
            className="h-10"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="project_manager">Project Manager</Label>
          <Input
            id="project_manager"
            value={formData.project_manager ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, project_manager: e.target.value })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="remarks">Remarks</Label>
          <textarea
            id="remarks"
            className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={formData.remarks ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
          />
        </div>
      </div>
    </div>

    <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
      <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleCreate}>Create</Button>
    </div>
  </DialogContent>
</Dialog>
    </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Total: {filtered.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contract / PO</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>PM</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => {
                    const customer = customers.find((c) => c.id === order.customer_id);
                    const status = statuses.find((s) => s.id === order.status_id);
                    return (
                      <TableRow key={order.id} >
                        <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium">{order.title}</p>
                          {order.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-62.5">
                              {order.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {customer?.name || "N/A"}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <p>{order.contract_number || "-"}</p>
                          <p className="text-muted-foreground">
                            {order.po_number || "-"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {order.total_value
                          ? `${order.currency} ${order.total_value.toLocaleString()}`
                          : "-"}
                      </TableCell>

                      <TableCell>
                        {status?.name || "N/A"}
                      </TableCell>

                      <TableCell>
                        {order.delivery_date
                          ? new Date(order.delivery_date).toLocaleDateString()
                          : "-"}
                      </TableCell>

                      <TableCell>
                        {order.project_manager || "-"}
                      </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-140">
          <DialogHeader className="space-y-1 border-b pb-4">
            <DialogTitle className="text-lg font-semibold">Edit Order</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Update the order information below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
              <Label htmlFor="order_number" className="text-sm font-medium sm:text-right">
                Order Number
              </Label>
              <Input
                id="order_number"
                value={formData.order_number}
                onChange={(e) =>
                  setFormData({ ...formData, order_number: e.target.value })
                }
                placeholder="ORD-001"
                className="h-10"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
              <Label htmlFor="customer" className="text-sm font-medium sm:text-right">
                Customer
              </Label>
              <Select
                value={formData.customer_id?.toString()}
                onValueChange={(v) =>
                  setFormData({ ...formData, customer_id: parseInt(v) })
                }
              >
                <SelectTrigger id="customer" className="h-10">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
              <Label htmlFor="status" className="text-sm font-medium sm:text-right">
                Status
              </Label>
              <Select
                value={formData.status_id?.toString()}
                onValueChange={(v) =>
                  setFormData({ ...formData, status_id: parseInt(v) })
                }
              >
                <SelectTrigger id="status" className="h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
