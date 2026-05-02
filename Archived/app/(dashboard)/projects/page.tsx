"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Calendar, Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDataStore, type Project, type ProjectStatus } from "@/lib/data-store";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { projects, orders, systems, addProject, updateProject, deleteProject } = useDataStore();
  const { hasAccess } = useAuth();
  const canEdit = hasAccess(["Admin", "Entry Operator"]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [formName, setFormName] = useState("");
  const [formOrderId, setFormOrderId] = useState<string>("none");
  const [formStatus, setFormStatus] = useState<ProjectStatus>("Planning");
  const [formDeliveryDate, setFormDeliveryDate] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openAdd() {
    setEditing(null);
    setFormName("");
    setFormOrderId("none");
    setFormStatus("Planning");
    setFormDeliveryDate("");
    setFormOpen(true);
  }

  function openEdit(e: React.MouseEvent, project: Project) {
    e.preventDefault();
    e.stopPropagation();
    setEditing(project);
    setFormName(project.name);
    setFormOrderId(project.orderId || "none");
    setFormStatus(project.status);
    setFormDeliveryDate(project.deliveryDate);
    setFormOpen(true);
  }

  function handleSave() {
    if (!formName.trim()) {
      toast.error("Project name is required.");
      return;
    }
    if (editing) {
      updateProject(editing.id, {
        name: formName,
        orderId: formOrderId === "none" ? "" : formOrderId,
        status: formStatus,
        deliveryDate: formDeliveryDate,
      });
      toast.success(`Project "${formName}" updated.`);
    } else {
      addProject({
        name: formName,
        orderId: formOrderId === "none" ? "" : formOrderId,
        status: formStatus,
        deliveryDate: formDeliveryDate,
      });
      toast.success(`Project "${formName}" created.`);
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    toast.success(`Project "${deleteTarget.name}" and its systems deleted.`);
    setDeleteTarget(null);
  }

  function onDeleteClick(e: React.MouseEvent, project: Project) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget(project);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage satellite projects and track delivery
          </p>
        </div>
        {canEdit && (
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Planning">Planning</SelectItem>
            <SelectItem value="Building">Building</SelectItem>
            <SelectItem value="Testing">Testing</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => {
          const projectSystems = systems.filter((s) =>
            project.systemIds.includes(s.id)
          );
          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="shadow-sm transition-all hover:shadow-md hover:border-primary/30 cursor-pointer h-full relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-card-foreground">
                      {project.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => openEdit(e, project)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={(e) => onDeleteClick(e, project)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">{project.id}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={project.status} />
                    <span className="text-xs font-mono text-muted-foreground">
                      {project.orderId || "\u2014"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {project.deliveryDate || "TBD"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {projectSystems.length} systems
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No projects found.
          </div>
        )}
      </div>

      {/* Add/Edit form modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? `Edit ${editing.name}` : "Add New Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Project Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. LEO CommSat Alpha" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ProjectStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Building">Building</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Delivery Date</Label>
                <Input type="date" value={formDeliveryDate} onChange={(e) => setFormDeliveryDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Linked Order (optional)</Label>
              <Select value={formOrderId} onValueChange={setFormOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.id} - {o.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSave}>
              {editing ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All associated systems and their hierarchy will also be removed.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
