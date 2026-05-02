"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { MaintenanceTimeline } from "@/components/maintenance-timeline";
import { maintenanceLogs, type MaintenanceLog } from "@/lib/dummy-data";

export default function MaintenancePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<MaintenanceLog | null>(null);

  const filtered = maintenanceLogs.filter((log) => {
    const matchesSearch =
      log.entityName.toLowerCase().includes(search.toLowerCase()) ||
      log.faultDescription.toLowerCase().includes(search.toLowerCase()) ||
      log.engineer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const entityLogs = selected
    ? maintenanceLogs.filter(
        (m) => m.entityId === selected.entityId || m.entityName === selected.entityName
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Maintenance</h1>
        <p className="text-sm text-muted-foreground">
          Track faults, repairs, and maintenance activities
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Open Issues</p>
            <p className="text-2xl font-bold text-foreground">
              {maintenanceLogs.filter((m) => m.status === "Open").length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Monitoring</p>
            <p className="text-2xl font-bold text-foreground">
              {maintenanceLogs.filter((m) => m.status === "Monitoring").length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-foreground">
              {maintenanceLogs.filter((m) => m.status === "Resolved").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Maintenance Logs
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Monitoring">Monitoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">ID</TableHead>
                <TableHead className="text-foreground">Project</TableHead>
                <TableHead className="text-foreground">Entity</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-foreground">Fault</TableHead>
                <TableHead className="text-foreground">Engineer</TableHead>
                <TableHead className="text-foreground">Date</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground text-right">History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-foreground">{log.id}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.projectId}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{log.entityName}</TableCell>
                  <TableCell>
                    <StatusBadge status={log.entityType} />
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                    {log.faultDescription}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.engineer}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{log.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(log)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Maintenance History: {selected?.entityName}
            </DialogTitle>
          </DialogHeader>
          <MaintenanceTimeline logs={entityLogs} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
