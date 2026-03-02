"use client";

import { useState } from "react";
import { Search, Download, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { inventory } from "@/lib/dummy-data";

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState(inventory);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<typeof inventory[0] | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<typeof inventory[0] | null>(null);

  const filtered = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  function exportCSV() {
    const headers = [
      "ID",
      "Name",
      "Type",
      "Serial Number",
      "Status",
      "Quantity",
      "Assigned Project",
      "Location",
      "Last Maintenance",
    ];
    const rows = filtered.map((i) => [
      i.id,
      i.name,
      i.type,
      i.serialNumber,
      i.status,
      i.quantity,
      i.assignedProject || "",
      i.location,
      i.lastMaintenanceDate || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleEdit(item: typeof inventory[0]) {
    setEditingItem(item);
    setFormData({ ...item });
    setIsEditDialogOpen(true);
  }

  function handleSaveEdit() {
    if (formData && editingItem) {
      setInventoryItems(
        inventoryItems.map((item) =>
          item.id === editingItem.id ? formData : item
        )
      );
      setIsEditDialogOpen(false);
      setEditingItem(null);
      setFormData(null);
    }
  }

  function handleDeleteConfirm(id: string) {
    setInventoryItems(inventoryItems.filter((item) => item.id !== id));
    setIsDeleteDialogOpen(false);
    setDeleteConfirmId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Track satellite components and equipment
          </p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Inventory Items ({filtered.length})
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Subsystem">Subsystem</SelectItem>
                  <SelectItem value="Module">Module</SelectItem>
                  <SelectItem value="Unit">Unit</SelectItem>
                  <SelectItem value="Component">Component</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Allocated">Allocated</SelectItem>
                  <SelectItem value="Installed">Installed</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Item Name</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-foreground">Serial Number</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Qty</TableHead>
                <TableHead className="text-foreground">Assigned Project</TableHead>
                <TableHead className="text-foreground">Location</TableHead>
                <TableHead className="text-foreground">Last Maint.</TableHead>
                <TableHead className="text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.type} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.serialNumber}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-foreground">{item.quantity}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.assignedProject || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.location}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {item.lastMaintenanceDate || "—"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeleteConfirmId(item.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details of this inventory item
            </DialogDescription>
          </DialogHeader>
          {formData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as typeof formData.status })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Allocated">Allocated</SelectItem>
                    <SelectItem value="Installed">Installed</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Under Maintenance">
                      Under Maintenance
                    </SelectItem>
                    <SelectItem value="Replaced">Replaced</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="assignedProject">Assigned Project</Label>
                <Input
                  id="assignedProject"
                  value={formData.assignedProject || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedProject: e.target.value || null,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Inventory Item"
        description="Are you sure you want to delete this inventory item? This action cannot be undone."
        destructive
        onConfirm={() => {
          if (deleteConfirmId) {
            handleDeleteConfirm(deleteConfirmId);
          }
        }}
      />
    </div>
  );
}
