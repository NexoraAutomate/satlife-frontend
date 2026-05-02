"use client";
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
import Link from 'next/link';
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Layers, FileText } from "lucide-react";
import {  Breadcrumb,  BreadcrumbItem,  BreadcrumbLink,  BreadcrumbList,  BreadcrumbPage,  BreadcrumbSeparator,} from "@/components/ui/breadcrumb";
import { StatusBadge } from "@/components/status-badge";
import { SystemTree } from "@/components/system-tree";
// import { MaintenanceTimeline } from "@/components/maintenanceLogs-timeline";
export default function ProjectDetailPage() {
  const {projects, systems , orders, maintenanceLogs} = useDataStore();
  const params = useParams();
  const projectId = params.id as string;
  const project = projects.find((p) => String(p.id) === projectId);
  const [maintenanceModal, setMaintenanceModal] = useState<{entityId: number; entityName: string;} | null>(null);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Project Not Found</h2>
        <Link href="/projects" className="mt-2 text-sm text-primary underline">
          Back to Projects
        </Link>
      </div>
    );
  }

const projectSystems = systems.filter((s) => s.project_id === project.id);
const order = orders.find((o) => o.id === project.order_id);
const systemIds = projectSystems.map((s) => s.id);
const projectMaintenanceLogs = maintenanceLogs.filter((m) =>  systemIds.includes(m.entity_id));
const entityLogs = maintenanceModal? maintenanceLogs.filter((m) =>m.entity_id === maintenanceModal.entityId): [];

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/projects">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
          <p className="text-sm font-mono text-muted-foreground">{project.id}</p>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Order</p>
              <p className="text-sm font-medium text-foreground">{order?.order_number || project.order_id}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivery Date</p>
              <p className="text-sm font-medium text-foreground">{project.end_date}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Systems</p>
              <p className="text-sm font-medium text-foreground">{projectSystems.length} assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={String(project.status)} className="mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Hierarchy Tree */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">
            System Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SystemTree
            systems={projectSystems}
            onShowMaintenance={(entityId, entityName) =>
              setMaintenanceModal({entityId: Number(entityId),
    entityName })
            }
          />
        </CardContent>
      </Card>

      {/* Project maintenanceLogs Logs */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">
            maintenanceLogs History ({projectMaintenanceLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MaintenanceTimeline logs={projectMaintenanceLogs} />
        </CardContent>
      </Card>

      {/* Entity maintenanceLogs Modal */}
      <Dialog
        open={!!maintenanceModal}
        onOpenChange={() => setMaintenanceModal(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              maintenanceLogs: {maintenanceModal?.entityName}
            </DialogTitle>
          </DialogHeader>
          <MaintenanceTimeline logs={entityLogs} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
