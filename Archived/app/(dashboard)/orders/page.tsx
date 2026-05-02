"use client";

import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDataStore, type Order, type OrderStatus } from "@/lib/data-store";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function OrdersPage() {
  const { orders, customers, projects, addOrder, updateOrder, deleteOrder } = useDataStore();
  const { hasAccess } = useAuth();
  const canEdit = hasAccess(["Admin", "Entry Operator"]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStatus, setFormStatus] = useState<OrderStatus>("Pending");
  const [formDescription, setFormDescription] = useState("");
  const [formLinkedProjectId, setFormLinkedProjectId] = useState<string>("none");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openAdd() {
    setEditing(null);
    setFormCustomerId(customers[0]?.id || "");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStatus("Pending");
    setFormDescription("");
    setFormLinkedProjectId("none");
    setFormOpen(true);
  }

  function openEdit(order: Order) {
    setEditing(order);
    setFormCustomerId(order.customerId);
    setFormDate(order.date);
    setFormStatus(order.status);
    setFormDescription(order.description);
    setFormLinkedProjectId(order.linkedProjectId || "none");
    setFormOpen(true);
  }

  function handleSave() {
    if (!formCustomerId || !formDescription.trim()) {
      toast.error("Customer and description are required.");
      return;
    }
    const customer = customers.find((c) => c.id === formCustomerId);
    const linkedProject = formLinkedProjectId === "none" ? null : formLinkedProjectId;

    if (editing) {
      updateOrder(editing.id, {
        customerId: formCustomerId,
        customerName: customer?.name || editing.customerName,
        date: formDate,
        status: formStatus,
        description: formDescription,
        linkedProjectId: linkedProject,
      });
      toast.success(`Order "${editing.id}" updated.`);
    } else {
      addOrder({
        customerId: formCustomerId,
        customerName: customer?.name || "",
        date: formDate,
        status: formStatus,
        description: formDescription,
        linkedProjectId: linkedProject,
      });
      toast.success("New order created.");
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteOrder(deleteTarget.id);
    toast.success(`Order "${deleteTarget.id}" deleted.`);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage satellite orders
          </p>
        </div>
        {canEdit && (
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Order
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base font-semibold text-card-foreground">
              All Orders ({filtered.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Order ID</TableHead>
                <TableHead className="text-foreground">Customer</TableHead>
                <TableHead className="text-foreground">Description</TableHead>
                <TableHead className="text-foreground">Date</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Linked Project</TableHead>
                {canEdit && <TableHead className="text-foreground text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm text-foreground">{order.id}</TableCell>
                  <TableCell className="text-foreground">{order.customerName}</TableCell>
                  <TableCell className="text-muted-foreground max-w-48 truncate">{order.description}</TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {order.linkedProjectId || "\u2014"}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(order)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(order)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit form modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? `Edit Order ${editing.id}` : "Add New Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Customer *</Label>
              <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Date</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Description *</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the order..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Linked Project (optional)</Label>
              <Select value={formLinkedProjectId} onValueChange={setFormLinkedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="No linked project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Order"
        description={`Are you sure you want to delete order "${deleteTarget?.id}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
